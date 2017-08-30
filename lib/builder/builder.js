import _ from 'lodash'
import { dirname } from 'path'
import Module from 'module'
import { Script } from 'vm'
import { transformFileSync } from 'babel-core'
import chalk from 'chalk'
import chokidar from 'chokidar'
import _debug from 'debug'
import { mkdirp, remove } from 'fs-extra'
import Tapable from 'tappable'
import pify from 'pify'
import _glob from 'glob'
import TransformOptions from './babel/transformOptions'
import { Utils } from 'common'

const glob = pify(_glob)
const debug = _debug('api:build')
debug.color = 2 // Green

const Status = {
  INITIAL: 0,
  WATCHING: 1,
  BUILD_DONE: 2,
  BUILDING: 4
}

export default class Builder extends Tapable {
  constructor (dynapi) {
    super()
    this.dynapi = dynapi
    this.options = dynapi.options
    this.transformOptions = TransformOptions.from(this)

    // request handlers, middlewares, error handlers
    this.handlers = {}

    // Dependents from transformed files
    this.dependentsOf = {}

    this._status = Status.INITIAL
  }

  fetch (filename) {
    const buildFilename = this.dynapi.redirectTo('build', filename)
    return (this.handlers[buildFilename] = this.handlers[buildFilename] || this.transform(filename).exports)
  }

  purge (filename) {
    const dependents = this.dependentsOf[filename]
    if (dependents !== undefined) {
      // Recursive purge dependents
      dependents.forEach(dependent => this.purge(dependent))
      // Empty the requester array
      delete this.dependentsOf[filename]
    }

    const buildFilename = this.dynapi.redirectTo('build', filename)
    delete this.handlers[buildFilename]
  }

  refresh (filename) {
    this.purge(filename)
    return this.fetch(filename)
  }

  watch () {
    /* istanbul ignore if */
    if (this._status & Status.WATCHING) {
      return this
    }

    this._status |= Status.WATCHING

    const patterns = [ this.options.routesDir ]
    const options = { ignoreInitial: true }

    debug('Start watching %O', patterns.map(p => this.dynapi.relativeFrom('src', p)))

    const regenerateRenderer = _.debounce(() => {
      // TODO Improve performance
      this.dynapi.renderer.createRenderer(this.handlers)
    }, 200)

    const verbs = {
      add: 'created',
      unlink: 'removed',
      change: 'modified'
    }

    const refreshFile = (event, filename, ...callbacks) => {
      debug(chalk`{magenta ${this.dynapi.relativeFrom('src', filename)}} has been {red ${verbs[event]}}.`)
      try {
        callbacks.forEach(cb => cb.call(this, filename))
      } catch (err) {
        Utils.printError(err, filename)
      }
    }

    const watcher = chokidar.watch(patterns, options)
      .on('add', f => refreshFile('add', f, this.fetch, regenerateRenderer))
      .on('unlink', f => refreshFile('unlink', f, this.purge, regenerateRenderer))
      .on('change', f => refreshFile('change', f, this.refresh))

    this.dynapi.plugin('close', () => {
      watcher.close()
      this._status &= ~Status.WATCHING
    })

    return this.build()
  }

  async build () {
    /* istanbul ignore if : Build once only */
    if (this._status & Status.BUILD_DONE) {
      return this
    }

    /* istanbul ifnore if : Debounce building */
    if (this._status & Status.BUILDING) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.build())
        }, 1000)
      })
    }

    this._status |= Status.BUILDING

    // TODO Move to `generate`
    await remove(this.options.build.rootDir)
    await mkdirp(this.options.build.routesDir)

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

    if (this.options.dev) {
      this.dynapi.renderer.createRenderer(this.handlers)
    }

    this._status &= ~Status.BUILDING
    return this
  }

  transform (filename) {
    const compileOptions = { filename, displayErrors: true }

    // TODO Geneate transformed filed from this
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

    if (this.options.dev) {
      // Save dependents to refresh caches on file changed
      const imports = transformed.metadata.modules.imports
      imports.forEach(({ source }) => {
        if (source[0] === '~' || source[0] === '.') {
          const key = this.dynapi.resolve(source, filename)
          this.dependentsOf[key] = this.dependentsOf[key] || []
          this.dependentsOf[key].push(filename)
        }
      })
    }

    return { exports, code: transformed.code }
  }

  require (request, filename) {
    if (request[0] === '~' || request[0] === '.') {
      return this.fetch(this.dynapi.resolve(request, filename))
    } else {
      return this.dynapi.require(request)
    }
  }
}
