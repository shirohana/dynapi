import _ from 'lodash'
import chalk from 'chalk'
import chokidar from 'chokidar'
import _debug from 'debug'
import Builder from './builder'
import { Utils } from 'common'

const debug = _debug('api:build')
debug.color = 2 // Green

const shift = Object.keys(Builder.Status).length

export default class Watcher extends Builder {
  constructor (dynapi) {
    super(dynapi)

    // Chokidar instance
    this.watcher = null

    // Dependents from transformed files
    this.dependents = {}
  }

  static get Status () {
    return {
      INITIAL: Builder.Status.INITIAL,
      WATCHING: 1 << shift,
      CLOSED: 2 << shift
    }
  }

  purge (filename) {
    const dependents = this.dependents[filename]
    if (dependents !== undefined) {
      // Recursive purge dependents
      dependents.forEach(dependent => this.purge(dependent))
      // Empty the requester array
      delete this.dependents[filename]
    }

    const buildFilename = this.dynapi.redirectTo('build', filename)
    delete this.handlers[buildFilename]
  }

  refresh (filename) {
    this.purge(filename)
    return this.fetch(filename)
  }

  transform (filename) {
    const transformed = super.transform(filename)

    // Save dependents to refresh caches on file changed
    const imports = transformed.source.metadata.modules.imports
    imports.forEach(({ source }) => {
      if (source[0] === '~' || source[0] === '.') {
        const key = this.dynapi.resolve(source, filename)
        this.dependents[key] = this.dependents[key] || []
        this.dependents[key].push(filename)
      }
    })

    return transformed
  }

  watch () {
    /* istanbul ignore if */
    if (this._status & Watcher.Status.WATCHING) {
      return this
    }

    this._status |= Watcher.Status.WATCHING

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

    this.watcher = chokidar.watch(patterns, options)
      .on('add', f => refreshFile('add', f, this.fetch, regenerateRenderer))
      .on('unlink', f => refreshFile('unlink', f, this.purge, regenerateRenderer))
      .on('change', f => refreshFile('change', f, this.refresh))

    this.dynapi.plugin('close', () => {
      this.watcher.close()
      this._status &= ~Watcher.Status.WATCHING
    })

    return this.build()
  }
}
