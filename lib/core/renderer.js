import Tapable from 'tappable'
import chalk from 'chalk'
import _debug from 'debug'
import { Messages, Times } from 'utils'
import Router from './router'

const debug = _debug('api:render')
debug.color = 6 // Cyan

export default class Renderer extends Tapable {
  constructor (dynapi) {
    super()
    this.dynapi = dynapi
    this.options = dynapi.options

    if (this.options.dev) {
      debug.enabled = true
    }

    this.router = new Router(this)
    this.handlers = {}
  }

  add ({ filepath, exports }) {
    this.router.set(filepath, exports)
    this.handlers[filepath] = exports
    return this
  }

  remove ({ filepath }) {
    this.router.unset(filepath)
    delete this.handlers[filepath]
    return this
  }

  /**
   * return true if route rendered, otherwise false
   */
  async attempt (url, context) {
    const { req, res } = context
    const { method } = req

    /* istanbul ignore if */
    if (debug.enabled) {
      debug(chalk`{red ${Times.currentTime()}} {cyan ${method} ${req.baseUrl}}{green ${req.url}}`)
    }

    const routes = this.router.calculate(method, url)

    if (!Array.isArray(routes)) {
      return false // Page not found
    }

    const symbol = this.options.symbol

    // Set up helpers
    req.params = req.params || {}

    const handlerChain = routes.reduce(async (resolving, route) => {
      const err = await resolving
      if (err !== undefined) {
        throw err
      }

      const { type, filepath, handler } = route

      // Before invoking handler
      switch (type) {
        case symbol.parameter:
          const { name: paramName, value: paramValue } = route
          req.params[paramName] = paramValue
          break
      }

      if (!filepath || !handler) {
        return Promise.resolve()
      }

      const {
        ignore: ignored,
        timeout = this.options.responseTimeout
      } = handler

      if (ignored) {
        /* istanbul ignore if */
        if (debug.enabled) {
          debug(chalk`{magenta ${filepath}} was ignored. You should remove the ignored file or 'ignore' property in production mode.`)
        }
        return Promise.resolve()
      }

      if (typeof handler !== 'function') {
        return Promise.resolve()
      }

      if (timeout === 0) {
        /* istanbul ignore if */
        if (debug.enabled) {
          debug(chalk`{magenta ${filepath}} rejected the request because timeout === 0`)
        }
        // eslint-disable-next-line no-throw-literal
        throw { silent: true, status: 408 }
      }

      let next = null

      switch (type) {
        case symbol.middleware:
          next = new Promise(resolve => handler(req, res, resolve))
          break

        case symbol.parameter:
          next = new Promise(resolve => handler(req, res, resolve, route.value))
          break

        case symbol.responser:
          if (typeof handler.then === 'function') {
            next = handler(req, res)
          } else {
            next = new Promise(resolve => resolve(handler(req, res)))
          }
      }

      if (timeout > 0) {
        next = await Promise.race([
          next,
          new Promise((resolve, reject) => setTimeout(() => {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({
              status: 408,
              message: `Error: Timeout exceeds \`${timeout}\` without calling next()\n` +
                `    at (${filepath}:1:1)`
            })
          }, timeout))
        ])
      }

      // Bind filepath for error capturing
      if (next instanceof Error) {
        next.filepath = filepath
      } else if (typeof next === 'string') {
        next = `Error: ${next}\n` +
          `    at exports.default (${filepath}:1:1)`
      }

      return next
    }, Promise.resolve())

    try {
      await handlerChain
    } catch (err) {
      if (!err.silent) {
        Messages.printError(err)
      }

      if (!res.headersSent) {
        res.statusCode = err.status || 500
        res.end(err.message || 'Interval server error', 'utf8')
      }
    }

    const hasResponser = (routes.length > 0 && routes[routes.length - 1].type === symbol.responser)

    if (hasResponser) {
      if (!res.headersSent) {
        res.statusCode = 408
        res.end()
      }
      return true
    } else {
      return false
    }
  }
}
