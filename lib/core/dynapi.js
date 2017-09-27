import { dirname, join, relative } from 'path'
import Tapable from 'tappable'
import _require from 'native-require'
import { Options, Utils } from 'common'
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
      // `Node.HTTP` -> `Connect`
      if (typeof req.originalUrl !== 'string') {
        req.originalUrl = req.url
      }

      // `Connect` -> `Express.js`
      if (typeof req.baseUrl !== 'string') {
        req.path = req.url.split('?')[0]
        req.baseUrl = this.options.baseUrl || (req.url === '/' ? req.originalUrl : req.originalUrl.slice(0, -req.url.length))
      }

      try {
        await this.renderer.renderRoute(req.path, {req, res})
      } catch (err) {
        Utils.printError(err)
      }

      // TODO Custom user handling
      if (!res.headersSent) {
        res.statusCode = 404
        res.end('Page not found', 'utf8')
      }
    }
  }

  async close (callback) {
    await this.applyPluginsAsync('close')

    if (typeof callback === 'function') {
      await callback()
    }
  }

  resolve (request, filename) {
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
      if (typeof filename === 'string') {
        return _require.from(dirname(filename)).resolve(request)
      } else {
        throw new TypeError(`Usage: resolve('${request}', filename) when resolving relative filename`)
      }
    } else {
      return _require.from(this.options.srcDir).resolve(request)
    }
  }

  // type in ['src', 'build', 'src.routes', 'build.routes']
  relativeFrom (type, filename) {
    const relativeFromMap = {
      'src': this.options.srcDir,
      'src.routes': this.options.routesDir,
      'build': this.options.build.rootDir,
      'build.routes': this.options.build.routesDir
    }

    const from = relativeFromMap[type]

    if (!from) {
      throw new TypeError(`Invalid type: ${type}`)
    }

    return relative(from, filename)
  }

  // _type in ['src', 'build', 'src.routes', 'build.routes']
  redirectTo (_type, filename) {
    const [type, subtype] = _type.split('.')

    switch (type) {
      case 'build':
        /* istanbul ignore if */
        if (!filename.startsWith(this.options.srcDir)) {
          throw new TypeError(`redirectTo('${_type}', filename) which filename should under 'srcDir'. Received '${filename}'`)
        }

        // Guess subtype
        if (subtype === 'routes' || filename.startsWith(this.options.routesDir)) {
          return join(this.options.build.routesDir, relative(this.options.routesDir, filename))
        }

        for (let [key, value] of this.options.aliases) {
          if (filename.startsWith(value)) {
            if (key === '') {
              return join(this.options.build.otherDir, relative(value, filename))
            } else {
              return join(this.options.build.aliasesDir, key, relative(value, filename))
            }
          }
        }

        break // Unreachable break
      case 'src':
        /* istanbul ignore if */
        if (!filename.startsWith(this.options.build.rootDir)) {
          throw new TypeError(`redirectTo('${_type}', filename) which filename should under 'build.rootDir'. Received '${filename}'`)
        }

        // Guess subtype
        if (subtype === 'routes' || filename.startsWith(this.options.build.routesDir)) {
          return join(this.options.routesDir, relative(this.options.build.routesDir, filename))
        } else if (filename.startsWith(this.options.build.aliasesDir)) {
          let relativeFilename = filename.slice(1 + this.options.build.aliasesDir.length)

          let [alias, suffix] = relativeFilename.match(aliasPattern).slice(1)
          let prefix = this.options.aliases.find(([_alias]) => _alias === alias)[1]

          return join(prefix, suffix)
        } else {
          return join(this.options.srcDir, relative(this.options.build.otherDir, filename))
        }
    }
  }
}
