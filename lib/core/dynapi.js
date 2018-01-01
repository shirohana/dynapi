import { dirname } from 'path'
import _require from 'native-require'
import Renderer from './renderer'
import { Options } from '../common'

const aliasPattern = new RegExp('^~?([^/]*)/?(.*)$')

export default class Dynapi {
  constructor (_options = {}) {
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
}
