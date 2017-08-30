import { existsSync } from 'fs'
import { dirname, join, relative } from 'path'
import Tapable from 'tappable'
import _require from 'native-require'
import { Options, Utils } from 'common'
import Renderer from './renderer'

const aliasPattern = new RegExp('^~([^/]*)/?(.*)$')

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

  checkGenerated () {
    return existsSync(join(this.options.buildDir, 'index.js'))
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
      const basedir = this.options.alias[prefix]

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

  relativeFrom (_type, filename) {
    const type = _type.replace(/Dir$/, '')

    if (typeof this.options[type + 'Dir'] !== 'string') {
      throw new SyntaxError(`Undefined dirtype of '${_type}'. See 'dynapi.options.{type}Dir'.`)
    }

    const dirFrom = this.options[type + 'Dir']

    return relative(dirFrom, filename)
  }

  redirectTo (_type, filename) {
    const type = _type.replace(/Dir$/, '')

    if (typeof this.options[type + 'Dir'] !== 'string') {
      throw new SyntaxError(`Undefined dirtype of '${_type}'. See 'dynapi.options.{type}Dir'.`)
    }

    const getDestType = () => {
      if (type === 'build') {
        return (filename.startsWith(this.options['apiDir']) ? 'buildApi' : 'build')
      } else {
        return type
      }
    }

    const getSrcType = () => {
      if (type === 'build') { // build -> src
        // Is filename from buildApi or not
        return (filename.startsWith(this.options['apiDir']) ? 'api' : 'src')
      } else if (type === 'src') { // src -> build
        return 'build'
      } else if (type.startsWith('build')) { // buildApi -> api
        return type.replace(/^build(.)/, (_, v) => v.toLowerCase())
      } else {
        // api -> (filename.startsWith(buildApi) ? buildApi : src)
        const buildType = type.replace(/^(.)/, v => 'build' + v.toUpperCase())
        return (filename.startsWith(this.options[buildType + 'Dir']) ? buildType : 'src')
      }
    }

    const dirFrom = this.options[getSrcType() + 'Dir']
    const dirTo = this.options[getDestType() + 'Dir']

    return join(dirTo, relative(dirFrom, filename))
  }
}
