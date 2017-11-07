import { dirname, join, relative } from 'path'
import Tapable from 'tappable'
import _require from 'native-require'
import { Options } from 'common'
import Renderer from './renderer'

const aliasPattern = new RegExp('^~?([^/]*)/?(.*)$')

export default class Dynapi extends Tapable {
  constructor (_options = {}) {
    super()

    this.options = Options.from(_options)
    this.require = _require.from(this.options.rootDir)

    this.renderer = new Renderer(this)
  }

  middleware () {
    return async (req, res, next) => {
      if (this.isIgnoredPath(req.path)) {
        return next()
      }

      // `Node.HTTP` -> `Connect`
      if (typeof req.originalUrl !== 'string') {
        req.originalUrl = req.url
      }

      // `Connect` -> `Express.js`
      if (typeof req.baseUrl !== 'string') {
        req.path = req.url.split('?')[0]
        req.baseUrl = this.options.baseUrl || (req.url === '/' ? req.originalUrl : req.originalUrl.slice(0, -req.url.length))
      }

      const routeRendered = await this.renderer.attempt(req.path, {req, res})

      if (!routeRendered) {
        if (typeof next === 'function') {
          next()
        } else {
          res.statusCode = 404
          res.end('Page not found', 'utf8')
        }
      }
    }
  }

  isIgnoredPath (path) {
    return this.options.ignorePaths.some(r => {
      if (r instanceof RegExp) {
        return r.test(path)
      } else {
        return r === path
      }
    })
  }

  async close (callback) {
    await this.applyPluginsAsync('close')

    /* istanbul ignore else */
    if (typeof callback === 'function') {
      await callback()
    }
  }

  resolve (request, filepath) {
    if (request[0] === '~') {
      const [prefix, suffix] = request.match(aliasPattern).slice(1)
      const basedir = this.options.aliases.find(([alias]) => alias === prefix)[1]

      /* istanbul ignore if : No need to test */
      if (basedir === undefined) {
        throw new TypeError(`Undefined alias of '${request}'. Please check options include alias: '${prefix}'`)
      }

      return _require.from(basedir).resolve('./' + suffix)
    } else if (request[0] === '.') {
      /* istanbul ignore else : No need to test */
      if (typeof filepath === 'string') {
        return _require.from(dirname(filepath)).resolve(request)
      } else {
        throw new TypeError(`Usage: resolve('${request}', filepath) when resolving relative filepath`)
      }
    } else {
      return _require.from(this.options.srcDir).resolve(request)
    }
  }

  // type in ['src', 'build', 'src.routes', 'build.routes']
  relativeFrom (type, filepath) {
    const relativeFromMap = {
      'src': this.options.srcDir,
      'src.routes': this.options.routesDir,
      'build': this.options.build.rootDir,
      'build.routes': this.options.build.routesDir
    }

    const from = relativeFromMap[type]

    /* istanbul ignore if */
    if (!from) {
      throw new TypeError(`Invalid type: ${type}`)
    }

    return relative(from, filepath)
  }

  // _type in ['src', 'build', 'src.routes', 'build.routes']
  redirectTo (_type, filepath) {
    const [type, subtype] = _type.split('.')

    switch (type) {
      case 'build':
        /* istanbul ignore if */
        if (!filepath.startsWith(this.options.srcDir)) {
          throw new TypeError(`redirectTo('${_type}', filepath) which filepath should under 'srcDir'. Received '${filepath}'`)
        }

        // Guess subtype
        if (subtype === 'routes' || filepath.startsWith(this.options.routesDir)) {
          return join(this.options.build.routesDir, relative(this.options.routesDir, filepath))
        }

        for (let [key, value] of this.options.aliases) {
          if (filepath.startsWith(value)) {
            if (key === '') {
              return join(this.options.build.otherDir, relative(value, filepath))
            } else {
              return join(this.options.build.aliasesDir, key, relative(value, filepath))
            }
          }
        }

        break // Unreachable break
      case 'src':
        /* istanbul ignore if */
        if (!filepath.startsWith(this.options.build.rootDir)) {
          throw new TypeError(`redirectTo('${_type}', filepath) which filepath should under 'build.rootDir'. Received '${filepath}'`)
        }

        // Guess subtype
        if (subtype === 'routes' || filepath.startsWith(this.options.build.routesDir)) {
          return join(this.options.routesDir, relative(this.options.build.routesDir, filepath))
        } else if (filepath.startsWith(this.options.build.aliasesDir)) {
          let relativeFilename = filepath.slice(1 + this.options.build.aliasesDir.length)

          let [alias, suffix] = relativeFilename.match(aliasPattern).slice(1)
          let prefix = this.options.aliases.find(([_alias]) => _alias === alias)[1]

          return join(prefix, suffix)
        } else {
          return join(this.options.srcDir, relative(this.options.build.otherDir, filepath))
        }
    }
  }
}
