import { dirname } from 'path'
import Module from 'module'
import { Script } from 'vm'
import { transformFileSync } from 'babel-core'
import Tapable from 'tappable'
import pify from 'pify'
import _glob from 'glob'
import TransformOptions from './babel/transformOptions'
import { Dynapi } from 'core'
import { Utils } from 'common'

const glob = pify(_glob)

export default class Builder extends Tapable {
  constructor (dynapi) {
    super()

    /* istanbul ignore if */
    if (!(dynapi instanceof Dynapi)) {
      throw new TypeError('Usage: constroctor(dynapi: Dynapi)')
    }

    this.dynapi = dynapi
    this.options = dynapi.options
    this.transformOptions = TransformOptions.from(this)

    // request handlers, middlewares, error handlers
    this.handlers = {}

    this._status = Builder.Status.INITIAL
  }

  static get Status () {
    return {
      INITIAL: 0,
      BUILDING: 1,
      BUILDED: 2
    }
  }

  fetch (filename) {
    const buildFilename = this.dynapi.redirectTo('build', filename)
    return (this.handlers[buildFilename] = this.handlers[buildFilename] || this.transform(filename).exports)
  }

  async build () {
    /* istanbul ignore if : Build once only */
    if (this._status & Builder.Status.BUILDED) {
      return this
    }

    /* istanbul ifnore if : Debounce building */
    if (this._status & Builder.Status.BUILDING) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.build())
        }, 1000)
      })
    }

    this._status |= Builder.Status.BUILDING

    const apiFiles = await glob('**/*.js', { cwd: this.options.routesDir, absolute: true })
    const transformPromises = apiFiles.map(async (filename) => {
      try {
        const transformed = this.transform(filename)
        const buildFilename = this.dynapi.redirectTo('build.routes', filename)

        this.handlers[buildFilename] = transformed.exports
      } catch (err) {
        Utils.printError(err)
      }
    })

    await Promise.all(transformPromises)

    this.dynapi.renderer.createRenderer(this.handlers)

    this._status &= ~Builder.Status.BUILDING
    return this
  }

  transform (filename) {
    const compileOptions = { filename, displayErrors: true }

    // Transform ES6 to ES5
    const transformed = transformFileSync(filename, this.transformOptions)

    // Compile to executable script
    const wrapper = Module.wrap(transformed.code)
    const script = new Script(wrapper, compileOptions)
    const compiledWrapper = script.runInThisContext(compileOptions)

    // Container for exports
    const m = { exports: {} }

    const requirer = (request) => this.require(request, filename)

    // Execute wrapper to fetch exports (exports, require, module, __filename, __dirname)
    compiledWrapper(m.exports, requirer, m, filename, dirname(filename))

    // Extract default exports
    const exports = m.exports && m.exports.default ? m.exports.default : {}
    delete m.exports.default
    Object.assign(exports, m.exports)

    return { exports, source: transformed }
  }

  require (request, filename) {
    if (request[0] === '~' || request[0] === '.') {
      return this.fetch(this.dynapi.resolve(request, filename))
    } else {
      return this.dynapi.require(request)
    }
  }
}
