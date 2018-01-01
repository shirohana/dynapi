import { dirname, join } from 'path'
import Module from 'module'
import { Script } from 'vm'
import { transformFileSync } from 'babel-core'
import glob from 'glob'
import TransformOptions from './babel/transformOptions'
import { Dynapi } from '../core'
import { Utils } from '../common'

export default class Builder {
  constructor (dynapi) {
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
    if (this.handlers[filepath]) {
      return this.handlers[filepath]
    } else {
      let exports

      try {
        const result = this.transform(filepath)
        exports = result.exports
      } catch (err) {
        Utils.printError(err, filepath)
        exports = Builder.getBuildFailureHandler(err)
      }

      return (this.handlers[filepath] = exports)
    }
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

    routeFiles.map(filepath => {
      const fullpath = join(this.options.routesDir, filepath)
      const exports = Builder.prototype.fetch.call(this, fullpath)

      this.dynapi.renderer.add({ filepath, exports })
    })

    this._status &= ~Builder.Status.BUILDING
    return this
  }

  transform (filepath) {
    const compileOptions = { filename: filepath, displayErrors: true }

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

  static getBuildFailureHandler (err) {
    return function dynapiTransformFailure (req, res, next) {
      err.status = 500

      if (typeof next === 'function') {
        return next(err)
      } else {
        throw err
      }
    }
  }
}
