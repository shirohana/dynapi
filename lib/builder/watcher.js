import { join, relative } from 'path'
import chalk from 'chalk'
import { FSWatcher } from 'chokidar'
import _debug from 'debug'
import Builder from './builder'

const debug = _debug('api:watch')
debug.color = 2 // Green

const watchers = []

export default class Watcher {
  constructor (builder) {
    if (!(builder instanceof Builder)) {
      throw new TypeError('Usage: new Watcher(builder: Builder)')
    }

    debug.enabled = true

    this.builder = builder
    this.router = builder.router

    this.isWatched = false

    // Chokidar instance
    this.fsWatcher = new FSWatcher({ ignoreInitial: true })

    // Dependents from transformed files
    this.dependents = {}

    // Extra files to watch from imports
    this.extraWatches = {}
  }

  static closeAll () {
    for (let watcher of watchers) {
      watcher.close()
    }
  }

  close () {
    this.fsWatcher.close()
  }

  async watch () {
    if (this.isWatched) {
      return
    }

    this.isWatched = true

    const listeners = [{
      event: 'add',
      verb: 'created',
      callback: this._add
    }, {
      event: 'unlink',
      verb: 'removed',
      callback: this._unlink
    }, {
      event: 'change',
      verb: 'modified',
      callback: this._change
    }]

    listeners.forEach(({ event, verb, callback }) => {
      this.fsWatcher.on(event, filename => {
        debug(chalk`{magenta ${relative(this.router.options.srcdir, filename)}} has been {red ${verb}}.`)
        callback.call(this, filename)
      })
    })

    const exts = this.builder.extensions.join('|')
    const watchDir = join(this.router.options.routesdir, `**/*.@(${exts})`)
    this.fsWatcher.add(watchDir)

    // Update route handle if file is under `routesdir`, otherwise watching changes of it
    this.builder.plugin('afterFetch', (filename, exports) => {
      if (filename.startsWith(this.router.options.routesdir)) {
        this.router.set(relative(this.router.options.routesdir, filename), exports)
      } else {
        this._watchFile(filename)
      }
    })

    // Save dependent if request is not a module
    this.builder.plugin('afterTransform', (filename, result) => {
      const imports = result.source.metadata.modules.imports
      imports.forEach(({ source }) => {
        if (source[0] === '~' || source[0] === '.') {
          const from = this.router.resolve(source, filename)
          this.dependents[from] = this.dependents[from] || []
          this.dependents[from].push(filename)
        }
      })
    })

    // TODO Better dev message
    debug('Start watching [ \'%s\' ]', relative(this.router.options.srcdir, watchDir))
  }

  _watchFile (filename) {
    const exists = this.extraWatches[filename]

    if (!exists) {
      this.fsWatcher.add(filename)
      this.extraWatches[filename] = true
    }

    return this
  }

  _unwatchFile (filename) {
    const exists = this.extraWatches[filename]

    /* istanbul ignore else */
    if (exists) {
      this.fsWatcher.unwatch(filename)
      delete this.extraWatches[filename]
    }

    return this
  }

  _add (filename) {
    this.builder.fetch(filename)
  }

  _unlink (filename) {
    const refetchList = this._purge(filename)

    if (filename.startsWith(this.router.options.routesdir)) {
      this.router.unset(relative(this.router.options.routesdir, filename))
    } else {
      this._unwatchFile(filename)
    }

    if (refetchList[0] === filename) {
      refetchList.shift()
    }

    refetchList.forEach(filename => this.builder.fetch(filename))
  }

  _change (filename) {
    this._unlink(filename)
    this.builder.fetch(filename)
  }

  _purge (filename, refetchList = []) {
    const dependents = this.dependents[filename]

    if (dependents !== undefined) {
      dependents.forEach(dependent => {
        this._purge(dependent, refetchList)
      })
      delete this.dependents[filename]
    }

    delete this.builder.handles[filename]

    if (filename.startsWith(this.router.options.routesdir)) {
      refetchList.push(filename)
    }

    return refetchList
  }
}
