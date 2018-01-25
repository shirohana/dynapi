import finalhandler from 'finalhandler'
import Anchor from './anchor'
import Renderer from './renderer'
import { DynapiOptions } from '../common'

export default class Dynapi extends Anchor {
  constructor (options) {
    super()

    this.options = DynapiOptions.from(options)
    this.renderer = new Renderer(this.options)
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
}
