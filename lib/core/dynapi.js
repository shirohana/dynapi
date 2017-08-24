import { existsSync } from 'fs'
import { join, relative } from 'path'
import Tapable from 'tappable'
import nrequire from 'native-require'
import { Options, Utils } from 'common'
import Renderer from './renderer'

export default class Dynapi extends Tapable {
  constructor (_options = {}) {
    super()

    this.options = Options.from(_options)
    this.nativeRequire = nrequire.from(this.options.rootDir)

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

  resolve (filename, options) {
    if (filename.startsWith('~')) {
      filename = filename.replace(/^~\/?(.*)$/, (_, v) => join(this.options.srcDir, v))
      return this.nativeRequire.resolve(filename)
    } else if (filename.startsWith('.')) {
      if (options && typeof options.from === 'string') {
        return this.nativeRequire.resolve(join(options.from, filename))
      } else {
        throw new SyntaxError(`Options.from was expected when relative resolving. See 'dynapi.resolve(filename, options)'`)
      }
    } else {
      return this.nativeRequire.resolve(filename)
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

    const getDestType = () => type // Keep code looks consistent

    const getSrcType = () => {
      if (type === 'build') { // build -> src
        return 'src'
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
