import { dirname, sep } from 'path'
import _require from 'native-require'
import { RouterOptions, Utils, objectValues } from '../common'
import Anchor from './anchor'
import RouteContext from './route-context'
import RouteIterator from './route-iterator'

export default class Router extends Anchor {
  constructor (options) {
    super()
    this.declareAnchor('sequence', 'beforeRequest', 'status', 'req', 'res', 'context')
    // Invoked by Renderer
    this.declareAnchor('sequence', 'request', 'req', 'res')

    this.options = RouterOptions.from(options)
    this.context = new RouteContext()
    this.handles = {}
  }

  iterator (req, res) {
    const status = { isSkipped: false }

    // Anchor: beforeRequest
    if (this.hasPlugin('beforeRequest')) {
      const context = {
        skip: () => (status.isSkipped = true)
      }
      this.anchor('beforeRequest', status, req, res, context)
    }

    return new RouteIterator(this, status)
  }

  set (filename, exports) {
    const { type, name, paths } = this.parse(filename)
    const types = this.options.prefixes

    switch (type) {
      case types.middleware:
        this.context.ensure(paths).middleware.set(name, { filename })
        break

      case types.parameter:
        const pattern = Utils.flattenRegexp(exports.pattern)
        this.context.ensure(paths).parameter.set(name, { filename, pattern })
        break

      case types.responser:
        if (this.options.methods.includes(name)) {
          this.context.ensure(paths).responser.set(name.toUpperCase(), { filename })
          break
        } else {
          // TODO Better dev message
          console.warn(`> Undefined HTTP verb '${name}' of '${filename}'`) // eslint-disable-line no-console
          return
        }

      case types.unknown:
        // TODO Better dev message
        console.warn(`> Unknown type of file '${filename}'`) // eslint-disable-line no-console
        return
    }

    this.handles[filename] = exports
  }

  unset (filename) {
    const { type, name, paths } = this.parse(filename)
    const types = this.options.prefixes

    switch (type) {
      case types.middleware:
        this.context.find(paths).middleware.unset(name)
        break

      case types.parameter:
        this.context.find(paths).parameter.unset(name)
        break

      case types.responser:
        this.context.find(paths).responser.unset(name.toUpperCase())
        break
    }

    delete this.handles[filename]
  }

  resolve (request, from) {
    const match = request.match(Utils.RESOLVE_ALIAS_REGEXP)

    if (!match) {
      return _require.from(this.options.rootdir).resolve(request)
    } else {
      const [, alias, paths] = match

      if (typeof alias === 'string') {
        const basedir = this.options.aliases[alias]
        if (!basedir) {
          throw new Error(`Undefined alias '${alias}' of '${request}'`)
        }
        return _require.from(basedir).resolve('.' + sep + paths)
      }

      return _require.from(dirname(from)).resolve(paths)
    }
  }

  require (request) {
    return _require.from(this.options.rootdir).require(request)
  }

  parse (filepath) {
    const dirs = filepath.split('/')
    const filename = dirs.pop()

    const { type, name, paths = [] } = this.parseFilename(filename)
    return { type, name, paths: [...dirs, ...paths] }
  }

  parseFilename (filename) {
    const match = filename.match(this.options.filenamePattern)
    const types = this.options.prefixes

    if (!match) {
      return { type: types.unknown }
    }

    const [, prefix, extraPaths] = match

    let type, name, paths
    const isResponser = !objectValues(types).includes(prefix)

    if (isResponser) {
      [type, name] = [types.responser, prefix]
    } else {
      [type, name] = [prefix, '']
    }

    // get.js or >.js
    // getUser.js or >check-user.js
    if (!extraPaths) {
      paths = []
    } else {
      const pathMatches = extraPaths.match(Utils.FILENAME_PATHS_REGEXP)
      if (!pathMatches) {
        return { type: types.unknown }
      }

      if (!isResponser) {
        name = pathMatches.pop()
      }

      paths = pathMatches.map(p => {
        if (p[0] === '(') {
          return p.slice(1, -1)
            .replace(/\\\\/g, '\\')
            .replace(/::/g, ':')
        } else {
          return Utils.kebabCase(p)
        }
      })
    }

    return { type, name, paths }
  }
}
