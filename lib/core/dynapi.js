import http from 'http'
import Anchor from './anchor'
import Renderer from './renderer'
import { DynapiOptions } from '../common'

export default class Dynapi extends Anchor {
  constructor (options) {
    super()

    this.options = DynapiOptions.from(options)
    this.renderer = new Renderer(options)
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

      const done = (err) => {
        if (!res.headersSent) {
          if (this.options.loose && typeof next === 'function') {
            next(err)
          } else {
            this.finalHandle(err, req, res)
          }
        }
      }

      await this.renderer.handle(req, res, done)
    }
  }

  /**
   * finalHandle(err, req, res)
   * or
   * finalHandle(req, res)
   *
   * Always sent application/json with status code (default: 404)
   */
  finalHandle (err, req, res) {
    // Swap the optional argument
    if (res === undefined) {
      [err, req, res] = [undefined, err, req]
    }

    // No nothing if headers already sent
    if (res.headersSent) {
      return
    }

    let status, message

    if (err) {
      status = getErrorStatusCode(err) || getResponseStatusCode(res)
      if (this.options.dev) {
        message = err.stack || err.message
      }
    } else {
      status = 404
    }

    message = message || http.STATUS_CODES[status]
    const body = JSON.stringify(message)

    res.statusCode = status
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Length', Buffer.byteLength(body))

    if (req.method === 'HEAD') {
      res.end()
    } else {
      res.end(body)
    }
  }
}

function getErrorStatusCode (err) {
  const status = err.status || err.statusCode
  return (typeof status === 'number' && (400 <= status && status < 600))
    ? status : undefined
}

function getResponseStatusCode (res) {
  const status = res.statusCode
  return (typeof status === 'number' && (400 <= status && status < 600))
    ? status : 500
}
