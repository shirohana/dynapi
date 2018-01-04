import { Utils, objectValues } from '../common'
import RouterContext from './router-context'

export default class Router {
  constructor (renderer) {
    this.renderer = renderer
    this.options = renderer.options

    this.symbol = this.options.symbol
    this.extensions = this.options.extensions
    this.symbolValues = objectValues(this.symbol).filter(v => typeof v === 'string')

    this.filenamePattern = filenamePatternOf(this)
    this.filenamePathsPattern = /([\w:-]+|\([^)]+\))/g

    this.context = new RouterContext()
    this.handles = {}
  }

  set (filename, exports) {
    const { type, name, paths } = this.parse(filename)
    const types = this.symbol

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
          // eslint-disable-next-line no-console
          console.warn(`> Undefined method '${name}' of '${filename}'`)
          return
        }

      case types.unknown:
        // eslint-disable-next-line no-console
        console.warn(`> Unknown prefix of '${filename}'`)
        return
    }

    this.handles[filename] = exports
  }

  unset (filename) {
    const { type, name, paths } = this.parse(filename)
    const types = this.symbol

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

  calculate (method, url) {
    const keys = url.slice(1).split('/').filter(v => v.length)
    const symbol = this.options.symbol
    const queue = []

    let route = this.context.root

    // Root middlewares
    if (route.middlewares.length > 0) {
      queue.push(...route.middlewares.map(m => ({
        type: symbol.middleware,
        filename: m.filename,
        handle: this.handles[m.filename]
      })))
    }

    let key
    // Solve routing
    while ((key = keys.shift()) !== undefined) {
      let found = false
      let args, params

      // Find next route
      if (typeof route.subRoutes[key] === 'object') {
        route = route.subRoutes[key]
        found = true
      } else {
        for (let paramRoute of objectValues(route.subParamRoutes)) {
          const matches = key.match(paramRoute.pattern)

          if (matches) {
            found = true
            args = matches.slice(1)
            params = paramRoute.params
            route = paramRoute
            break
          }
        }
      }

      if (!found) { break }

      // Process parameters
      if (args) {
        queue.push(...params.map((name, index) => {
          const filename = params[name] && params[name].filename
          return {
            type: symbol.parameter,
            name,
            value: args[index],
            filename,
            handle: this.handles[filename]
          }
        }))
      }

      // Process middlewares
      if (route.middlewares.length > 0) {
        queue.push(...route.middlewares.map(m => ({
          type: symbol.middleware,
          filename: m.filename,
          handle: this.handles[m.filename]
        })))
      }
    }

    // All paths found
    const r = route.responsers[method]
    if (r) {
      queue.push({
        type: symbol.responser,
        filename: r.filename,
        handle: this.handles[r.filename]
      })
    }

    return queue
  }

  parse (filepath) {
    const dirs = filepath.split('/')
    const filename = dirs.pop()

    const { type, name, paths = [] } = this.parseFilename(filename)
    return { type, name, paths: [...dirs, ...paths] }
  }

  parseFilename (filename) {
    const matches = filename.match(this.filenamePattern)

    if (!matches) {
      return { type: this.symbol.unknown }
    }

    const [, prefix, extraPaths] = matches

    let type, name, paths
    const isResponser = !this.symbolValues.includes(prefix)

    if (isResponser) {
      [type, name] = [this.symbol.responser, prefix]
    } else {
      [type, name] = [prefix, '']
    }

    // get.js or >.js
    // getUser.js or >check-user.js
    if (!extraPaths) {
      paths = []
    } else {
      const pathMatches = extraPaths.match(this.filenamePathsPattern)
      if (!pathMatches) {
        return { type: this.symbol.unknown }
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

function filenamePatternOf ({ symbolValues, extensions }) {
  const prefix = [...symbolValues, '[a-z]+'].join('|')
  const ext = extensions.map(ext => ext.replace(/\./g, '\\.')).join('|')
  return new RegExp(`^(${prefix})(.*?)?(${ext})$`)
}
