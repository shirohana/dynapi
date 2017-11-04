import chalk from 'chalk'
import { FSWatcher } from 'chokidar'
import _debug from 'debug'
import Builder from './builder'

const debug = _debug('api:watch')
debug.color = 2 // Green

const shift = Object.keys(Builder.Status).length

export default class Watcher extends Builder {
  constructor (dynapi) {
    super(dynapi)

    /* istanbul ignore else */
    if (this.options.dev) {
      debug.enabled = true
    }

    // Chokidar instance
    this.watcher = new FSWatcher({ ignoreInitial: true })

    // Dependents from transformed files
    this.dependents = {}

    // Extra files to watch from imports
    this.extraWatches = {}

    // TODO Check is it needs to be bind
    this.dynapi.plugin('close', this.close.bind(this))
  }

  static get Status () {
    return {
      INITIAL: Builder.Status.INITIAL,
      WATCHING: 1 << shift
    }
  }

  watch () {
    /* istanbul ignore if */
    if (this._status & Watcher.Status.WATCHING) {
      return this.build()
    }

    this._status |= Watcher.Status.WATCHING

    const listeners = [{
      event: 'add',
      verb: 'created',
      callback: this.fetch
    }, {
      event: 'unlink',
      verb: 'removed',
      callback: this.purge
    }, {
      event: 'change',
      verb: 'modified',
      callback: this.refresh
    }]

    listeners.forEach(({ event, verb, callback }) => {
      this.watcher.on(event, filepath => {
        debug(chalk`{magenta ${this.dynapi.relativeFrom('src', filepath)}} has been {red ${verb}}.`)
        callback.call(this, filepath)
      })
    })

    const patterns = [ this.options.routesDir ]
    this.watcher.add(patterns)

    debug('Start watching %O', patterns.map(p => this.dynapi.relativeFrom('src', p)))

    return this.build()
  }

  add (filepath) {
    const exists = this.extraWatches[filepath]

    if (!exists) {
      this.watcher.add(filepath)
      this.extraWatches[filepath] = true
    }

    return this
  }

  unwatch (filepath) {
    const exists = this.extraWatches[filepath]

    if (exists) {
      this.watcher.unwatch(filepath)
      delete this.extraWatches[filepath]
    }

    return this
  }

  close () {
    this._status &= ~Watcher.Status.WATCHING
    this.watcher.close()
  }

  /* Override */
  fetch (filepath) {
    const exports = super.fetch(filepath)

    if (filepath.startsWith(this.options.routesDir)) {
      this.dynapi.renderer.add({
        filepath: this.dynapi.relativeFrom('src.routes', filepath),
        exports
      })
    } else {
      this.add(filepath)
    }

    return exports
  }

  purge (filepath) {
    const refetchList = []
    this._recursivePurge(filepath, refetchList)

    if (filepath.startsWith(this.options.routesDir)) {
      this.dynapi.renderer.remove({
        filepath: this.dynapi.relativeFrom('src.routes', filepath)
      })
    } else {
      this.unwatch(filepath)
    }

    if (refetchList[0] === filepath) { refetchList.shift() }
    refetchList.forEach(this.fetch.bind(this))
  }

  _recursivePurge (filepath, refetchList) {
    const dependents = this.dependents[filepath]
    if (dependents !== undefined) {
      // Recursive purge dependents
      dependents.forEach(dependent => this._recursivePurge(dependent, refetchList))
      // Empty the requester array
      delete this.dependents[filepath]
    }

    const buildFilename = this.dynapi.redirectTo('build', filepath)
    delete this.handlers[buildFilename]

    if (filepath.startsWith(this.options.routesDir)) {
      refetchList.push(filepath)
    }
  }

  refresh (filepath) {
    this.purge(filepath)
    return this.fetch(filepath)
  }

  /* Override */
  transform (filepath) {
    const transformed = super.transform(filepath)

    // Save dependents to refresh caches on file changed
    const imports = transformed.source.metadata.modules.imports
    imports.forEach(({ source }) => {
      /* istanbul ignore else */
      if (source[0] === '~' || source[0] === '.') {
        const key = this.dynapi.resolve(source, filepath)
        this.dependents[key] = this.dependents[key] || []
        this.dependents[key].push(filepath)
      }
    })

    return transformed
  }
}
