import { dirname, join } from 'path'
import Module from 'module'
import { Script } from 'vm'
import { transformFileSync } from 'babel-core'
import Tapable from 'tappable'
import glob from 'glob'
import TransformOptions from './babel/transformOptions'
import { Dynapi } from 'core'
import { Messages } from 'utils'

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

  fetch (filepath) {
    const buildFilename = this.dynapi.redirectTo('build', filepath)
    return (this.handlers[buildFilename] = this.handlers[buildFilename] || this.transform(filepath).exports)
  }

  async build () {
    /* istanbul ignore if : Build once only */
    if (this._status & Builder.Status.BUILDED) {
      return this
    }

    /* istanbul ignore if : Debounce building */
    if (this._status & Builder.Status.BUILDING) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.build())
        }, 1000)
      })
    }

    this._status |= Builder.Status.BUILDING

    const routeFiles = glob.sync('**/*.js', { cwd: this.options.routesDir })

    const transformPromises = routeFiles.map(async (filepath) => {
      try {
        const fullpath = join(this.options.routesDir, filepath)
        const buildFilepath = this.dynapi.redirectTo('build.routes', fullpath)
        const { exports } = this.transform(fullpath)

        this.handlers[buildFilepath] = exports
        this.dynapi.renderer.add({ filepath, exports })
      } catch (err) {
        Messages.printError(err)
      }
    })

    await Promise.all(transformPromises)

    this._status &= ~Builder.Status.BUILDING
    return this
  }

  transform (filepath) {
    const compileOptions = { filepath, displayErrors: true }

    // Transform ES6 to ES5
    const transformed = transformFileSync(filepath, this.transformOptions)

    // Compile to executable script
    const wrapper = Module.wrap(transformed.code)
    const script = new Script(wrapper, compileOptions)
    const compiledWrapper = script.runInThisContext(compileOptions)

    // Container for exports
    const m = { exports: {} }

    const requirer = (request) => this.require(request, filepath)

    // Execute wrapper to fetch exports (exports, require, module, __filename, __dirname)
    compiledWrapper(m.exports, requirer, m, filepath, dirname(filepath))

    // Extract default exports
    const exports = m.exports && m.exports.default ? m.exports.default : {}
    delete m.exports.default
    Object.assign(exports, m.exports)

    return { exports, source: transformed }
  }

  require (request, filepath) {
    if (request[0] === '~' || request[0] === '.') {
      return this.fetch(this.dynapi.resolve(request, filepath))
    } else {
      return this.dynapi.require(request)
    }
  }
}
