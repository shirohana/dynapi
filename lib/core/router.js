import { Routes, Strings, objectValues, objectEntries } from 'utils'
import RouterContext from './router-context'

export default class Router {
  constructor (renderer) {
    this.renderer = renderer
    this.options = renderer.options

    this.symbol = this.options.symbol
    this.extensions = this.options.extensions
    this._symbolValues = objectValues(this.symbol)

    this.filenamePattern = filenamePatternOf(this)
    this.filenamePathsPattern = /([\w:-]+|\([^)]+\))/g

    this.context = new RouterContext()
    this.handlerRefs = {}
  }

  ['set'] (filepath, exports) {
    const { type, name, paths } = this.parseFilepath(filepath)
    const symbol = this.symbol

    switch (type) {
      case symbol.middleware:
        return this.context.ensure(paths).middleware.set(name || 'anonymous', { filepath })

      case symbol.parameter:
        const pattern = Routes.flattenParamPattern(exports.pattern)
        return this.context.ensure(paths).parameter.set(name, { filepath, pattern })

      case symbol.responser:
        const priority = this.options.methods.indexOf(name)
        if (priority < 0) {
          // eslint-disable-next-line no-console
          return console.warn(`> ${filepath} has priority < 0, ignore it.`)
        } else {
          return this.context.ensure(paths).responser.set(name.toUpperCase(), { filepath })
        }

      default:
        // eslint-disable-next-line no-console
        return console.warn(`> unhandled filetype: ${type} of ${filepath}`)
    }
  }

  unset (filepath) {
    const { type, name, paths } = this.parseFilepath(filepath)
    const symbol = this.symbol

    switch (type) {
      case symbol.middleware:
        return this.context.find(paths).middleware.unset(name || 'anonymous')

      case symbol.parameter:
        return this.context.find(paths).parameter.unset(name)

      case symbol.responser:
        return this.context.find(paths).responser.unset(name.toUpperCase())

      default:
        // eslint-disable-next-line no-console
        return console.warn(`> unhanded filetype: ${type} of ${filepath}`)
    }
  }

  calculate (method, url) {
    const keys = url.slice(1).split('/').filter(v => v.length)
    const symbol = this.options.symbol
    const queue = []

    let route = this.context.root

    // Root middlewares
    if (route.middlewares.length > 0) {
      queue.push(...route.middlewares.map(filepath => ({
        type: symbol.middleware,
        filepath,
        handler: this.renderer.handlers[filepath]
      })))
    }

    let key
    // Solve routing
    while ((key = keys.shift()) !== undefined) {
      let found = false
      let args, params

      // Find next route
      if (typeof route.subRoute[key] === 'object') {
        route = route.subRoute[key]
        found = true
      } else {
        for (let paramRoute of objectValues(route.subParamRoute)) {
          const { pattern, computedParameters } = paramRoute
          const matches = key.match(pattern)

          if (matches) {
            found = true
            args = matches.slice(1)
            params = computedParameters
            route = paramRoute
            break
          }
        }
      }

      if (!found) { return null }

      // Process parameters
      if (args) {
        queue.push(...objectEntries(params).map(([name, route], index) => ({
          type: symbol.parameter,
          name,
          value: args[index],
          filepath: (route && route.filepath) || null,
          handler: this.renderer.handlers[route && route.filepath] || null
        })))
      }

      // Process middlewares
      if (route.middlewares.length > 0) {
        queue.push(...route.middlewares.map(filepath => ({
          type: symbol.middleware,
          filepath,
          handler: this.renderer.handlers[filepath]
        })))
      }
    }

    // All paths found
    if (route.responsers[method]) {
      const responser = route.responsers[method]
      queue.push({
        type: symbol.responser,
        filepath: responser.filepath,
        handler: this.renderer.handlers[responser.filepath]
      })
    }

    return queue
  }

  parseFilepath (filepath) {
    const dirs = filepath.split('/')
    const filename = dirs.pop()

    const filenamePaths = this.parseFilename(filename)
    if (!filenamePaths) {
      return null
    } else {
      const { type, name, paths } = filenamePaths
      return { type, name, paths: dirs.concat(paths) }
    }
  }

  parseFilename (filename) {
    const matches = filename.match(this.filenamePattern)

    if (!matches) {
      return { type: `Unknown filetype of ${filename}` }
    }

    const [, type, filenamePaths] = matches

    const isResponser = !this._symbolValues.includes(type)

    // get.js or >.js
    if (!filenamePaths) {
      return {
        type: (isResponser ? this.symbol.responser : type),
        name: (isResponser ? type : ''),
        paths: []
      }
    }

    // getUser.js or >check-user.js
    const paths = filenamePaths.match(this.filenamePathsPattern)
    if (!paths) {
      return { type: `Unknown filename format of ${filename}` }
    } else {
      return {
        type: (isResponser ? this.symbol.responser : type),
        name: (isResponser ? type : paths.pop()),
        paths: paths.map(p => {
          if (p[0] === '(') {
            return p.slice(1, -1)
              .replace(/\\\\/g, '\\')
              .replace(/::/g, ':')
          } else {
            return Strings.kebabCase(p)
          }
        })
      }
    }
  }
}

function filenamePatternOf ({ symbol, extensions }) {
  const prefix = objectValues(symbol).concat('[a-z]+').join('|')
  const ext = extensions.map(ext => ext.replace(/\./g, '\\.')).join('|')
  return new RegExp(`^(${prefix})(.*?)?(${ext})$`)
}
