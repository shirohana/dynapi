import _ from 'lodash'
import chalk from 'chalk'
import { FSWatcher } from 'chokidar'
import _debug from 'debug'
import Builder from './builder'
import { Utils } from 'common'

const debug = _debug('api:watch')
debug.color = 2 // Green

const shift = Object.keys(Builder.Status).length

export default class Watcher extends Builder {
  constructor (dynapi) {
    super(dynapi)

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

    const regenerateRenderer = _.debounce(() => {
      // TODO Improve performance
      this.dynapi.renderer.createRenderer(this.handlers)
    }, 200)

    const listeners = [{
      event: 'add',
      verb: 'created',
      callbacks: [this.fetch, regenerateRenderer]
    }, {
      event: 'unlink',
      verb: 'remove',
      callbacks: [this.purge, regenerateRenderer]
    }, {
      event: 'change',
      verb: 'modified',
      callbacks: [this.refresh]
    }]

    listeners.forEach(({ event, verb, callbacks }) => {
      this.watcher.on(event, filename => {
        debug(chalk`{magenta ${this.dynapi.relativeFrom('src', filename)}} has been {red ${verb}}.`)

        try {
          callbacks.forEach(cb => cb.call(this, filename))
        } catch (err) {
          Utils.printError(err, filename)
        }
      })
    })

    const patterns = [ this.options.routesDir ]
    this.watcher.add(patterns)

    debug('Start watching %O', patterns.map(p => this.dynapi.relativeFrom('src', p)))

    return this.build()
  }

  add (filename) {
    const exists = this.extraWatches[filename]

    if (!exists) {
      this.watcher.add(filename)
      this.extraWatches[filename] = true
    }

    return this
  }

  unwatch (filename) {
    const exists = this.extraWatches[filename]

    if (exists) {
      this.watcher.unwatch(filename)
      delete this.extraWatches[filename]
    }

    return this
  }

  close () {
    this._status &= ~Watcher.Status.WATCHING
    this.watcher.close()
  }

  /* Override */
  fetch (filename) {
    if (!filename.startsWith(this.options.routesDir)) {
      this.add(filename)
    }
    return super.fetch(filename)
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

    if (filename.startsWith(this.options.routesDir)) {
      super.fetch(filename)
    } else {
      this.unwatch(filename)
    }
  }

  refresh (filename) {
    this.purge(filename)
    return super.fetch(filename)
  }

  /* Override */
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
}
