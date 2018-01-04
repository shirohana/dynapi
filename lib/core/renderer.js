import chalk from 'chalk'
import _debug from 'debug'
import { Utils } from '../common'
import Router from './router'

const debug = _debug('api:render')
debug.color = 6 // Cyan

export default class Renderer {
  constructor (dynapi) {
    this.dynapi = dynapi
    this.options = dynapi.options

    /* istanbul ignore else */
    if (this.options.dev) {
      debug.enabled = true
    }

    this.router = new Router(this)
  }

  add ({ filepath, exports }) {
    this.router.set(filepath, exports)
    return this
  }

  remove ({ filepath }) {
    this.router.unset(filepath)
    return this
  }

  /**
   * return true if route rendered, otherwise false
   */
  async attempt (url, context) {
    const { req, res } = context
    const { method } = req

    /* istanbul ignore else */
    if (debug.enabled) {
      debug(chalk`{red ${Utils.currentTime()}} {cyan ${method} ${req.baseUrl}}{green ${req.url}}`)
    }

    const routes = this.router.calculate(method, decodeURI(url))

    if (!Array.isArray(routes) || routes.length === 0) {
      return false // Page not found
    }

    const symbol = this.options.symbol

    // Set up helpers
    req.params = req.params || {}

    const handleChain = routes.reduce(async (resolving, route) => {
      await resolving

      const { type, filename, handle } = route

      // Before invoking handle
      if (type === symbol.parameter) {
        req.params[route.name] = route.value
      }

      // Unhandled parameter could only have { type, name, value }
      if (!filename || !handle) {
        return
      }

      const {
        ignore: ignored,
        timeout = this.options.responseTimeout
      } = handle

      if (ignored) {
        /* istanbul ignore else */
        if (debug.enabled) {
          debug(chalk`{magenta ${filename}} was ignored. You should remove the ignored file or 'ignore' property in production mode.`)
        }
        return
      }

      if (typeof handle !== 'function') {
        return
      }

      // TODO Notice user there should only use `timeout === 0` in dev-mode
      if (timeout === 0) {
        /* istanbul ignore else */
        if (debug.enabled) {
          debug(chalk`{magenta ${filename}} rejected the request because timeout === 0`)
        }
        throw { silent: true, status: 408 } // eslint-disable-line no-throw-literal
      }

      let next = null

      switch (type) {
        case symbol.middleware:
          next = new Promise(resolve => handle(req, res, resolve))
          break

        case symbol.parameter:
          next = new Promise(resolve => handle(req, res, resolve, route.value))
          break

        case symbol.responser:
          next = handle(req, res)
      }

      /* istanbul ignore else */
      if (timeout > 0) {
        next = Promise.race([
          next,
          new Promise(resolve => setTimeout(() => {
            resolve({
              status: 408,
              message: `Error: Timeout exceeds \`${timeout}\` without calling next()\n` +
                `    at (${filename}:1:1)`
            }) // eslint-disable-line prefer-promise-reject-errors
          }, timeout))
        ])
      }

      next = await next

      if (res.headersSent) {
        throw { silent: true } // eslint-disable-line no-throw-literal
      }

      if (next !== undefined) {
        // Bind filename for error capturing
        if (next instanceof Error) {
          next.filename = filepath
        } else if (typeof next === 'string') {
          next = `Error: ${next}\n` +
            `    at exports.default (${filepath}:1:1)`
        }
        throw next
      }
    }, Promise.resolve())

    try {
      await handleChain
    } catch (err) {
      const isSilent = (typeof err.silent === 'boolean' ? err.silent : !this.options.dev)

      /* istanbul ignore else */
      if (!isSilent) {
        Utils.printError(err)
      }

      /* istanbul ignore else */
      if (!res.headersSent) {
        res.statusCode = err.status || 500
        res.end(err.message || 'Interval server error', 'utf8')
      }
    }

    if (res.headersSent) {
      return true
    } else if (routes[routes.length - 1].type === symbol.responser) {
      res.statusCode = 408
      res.end()
      return true
    } else {
      return false
    }
  }
}
