import finalhandler from 'finalhandler'
import Renderer from './renderer'
import { DynapiOptions } from '../common'

export default class Dynapi {
  constructor (options) {
    this.options = DynapiOptions.from(options)
    this.renderer = new Renderer(this.options)
  }

  middleware () {
    return async (req, res, next) => {
      // TODO Move to plugin
      const isIgnored = this._checkIsIgnored(req.path)
      if (isIgnored) {
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

      const done = () => {
        if (!res.headersSent) {
          if (this.options.loose && typeof next === 'function') {
            next()
          } else {
            finalhandler(req, res)()
          }
        }
      }

      await this.renderer.handle(req, res, done)
    }
  }

  // TODO Move to plugin
  _checkIsIgnored (path) {
    let passed = false
    for (let ignorePath of this.options.ignorePaths) {
      if (typeof ignorePath === 'string') {
        passed = (path === ignorePath)
      } else if (ignorePath instanceof RegExp) {
        passed = (ignorePath.test(path))
      }
      if (passed) {
        return true
      }
    }
    return false
  }
}
