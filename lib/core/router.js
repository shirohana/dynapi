import { Routes, Strings, objectValues, objectEntries } from 'utils'
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

      case symbol.unknown:
        // eslint-disable-next-line no-console
        return console.warn(`> Unknown type of file ${filepath}`)
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

    const { type, name, paths = [] } = this.parseFilename(filename)
    return { type, name, paths: dirs.concat(paths) }
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
          return Strings.kebabCase(p)
        }
      })
    }

    return { type, name, paths }
  }
}

function filenamePatternOf ({ symbolValues, extensions }) {
  const prefix = symbolValues.concat('[a-z]+').join('|')
  const ext = extensions.map(ext => ext.replace(/\./g, '\\.')).join('|')
  return new RegExp(`^(${prefix})(.*?)?(${ext})$`)
}
