import Tapable from 'tappable'
import chalk from 'chalk'
import _debug from 'debug'
import _glob from 'glob'
import pify from 'pify'
import { Utils } from 'common'
import Router from './router'

const glob = pify(_glob)
const debug = _debug('api:render')
debug.color = 6 // Cyan

const Status = {
  INITIAL: 0,
  RENDERER_CREATED: 1,
  RENDERER_CREATING: 2
}

export default class Renderer extends Tapable {
  constructor (dynapi) {
    super()
    this.dynapi = dynapi
    this.options = dynapi.options

    this.router = new Router(this)
    this.handlers = null

    this._status = Status.INITIAL
  }

  async createRenderer (handlers = {}) {
    this._status &= ~Status.RENDERER_CREATED

    if (this.options.dev) {
      this._status |= Status.RENDERER_CREATING

      const files = await glob('**/*.js', { cwd: this.options.routesDir })
      this.router.generate(files)
      this.handlers = handlers

      this._status = Status.RENDERER_CREATED | (this._status & ~Status.RENDERER_CREATING)

      return this
    } else {
      throw new Error('Unimplemented')
    }
  }

  async renderRoute (url, context) {
    if (!(this._status & Status.RENDERER_CREATED)) {
      if (this._status & Status.RENDERER_CREATING) {
        return new Promise(resolve => {
          setTimeout(() => resolve(this.renderRoute(url, context)), 1000)
        })
      } else {
        // eslint-disable-next-line no-console
        console.error('> TODO: Renderer is not created.')
        return
      }
    }

    const { req, res } = context
    const { method } = req

    // Prevent from calling `Utils.currentTime` to frequently
    if (debug.enabled) {
      debug(chalk`{red ${Utils.currentTime()}} {cyan ${method} ${req.baseUrl}}{green ${req.url}}`)
    }

    const routes = this.router.calculate(method, url)

    if (!Array.isArray(routes)) {
      return // Page not found
    }

    const r = (filename) => this.dynapi.relativeFrom('src.routes', this.dynapi.redirectTo('src.routes', filename))

    const handlerChain = routes.reduce(async (resolving, route) => {
      const err = await resolving
      if (err !== undefined) {
        throw err
      }

      const { type, handler, filename } = route
      const { ignore: ignored, timeout = this.options.responseTimeout } = handler

      if (typeof handler !== 'function') {
        if (debug.enabled) {
          debug(chalk`Missing default export of {magenta ${r(filename)}}, ignored.`)
        }
        return Promise.resolve()
      }

      if (ignored) {
        if (debug.enabled) {
          debug(chalk`{magenta ${r(filename)}} was ignored.`)
        }
        return Promise.resolve()
      }

      if (timeout === 0) {
        if (debug.enabled) {
          debug(chalk`{magenta ${r(filename)}} rejected request because timeout: 0`)
        }
        // eslint-disable-next-line no-throw-literal
        throw { silent: true, status: 480 }
      }

      let next = null

      const params = (amount) => {
        if (handler.length !== amount && debug.enabled) {
          debug(chalk`{magenta ${r(filename)}} (as {red ${type}}) should contains {red ${amount}} parameters.`)
        }
      }

      switch (type) {
        case 'middleware':
          params(3)

          next = new Promise(resolve => handler(req, res, resolve))
          break

        case 'param':
          params(4)

          const { name: paramName, value: paramValue } = route
          req.params = req.params || []
          req.params[paramName] = paramValue
          next = new Promise(resolve => handler(req, res, resolve, paramValue))
          break

        case 'method':
          params(2)

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
                `    at (${this.dynapi.redirectTo('src.routes', filename)}:1:1)`
            })
          }, timeout))
        ])
      }

      // Bind filename for error capturing
      if (next instanceof Error) {
        next.filename = this.dynapi.redirectTo('src.routes', filename)
      } else if (typeof next === 'string') {
        next = `Error: ${next}\n` +
          `    at exports.default (${this.dynapi.redirectTo('src.routes', filename)}:1:1)`
      }

      return next
    }, Promise.resolve())

    try {
      await handlerChain
    } catch (err) {
      // TODO Custom error handling
      if (!err.silent) {
        Utils.printError(err)
      }

      // Simple Custom error handling
      if (typeof err.status === 'number') {
        res.sendStatus(err.status)
      }
    }
  }
}
