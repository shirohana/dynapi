import chalk from 'chalk'
import finalhandler from 'finalhandler'
import _debug from 'debug'
import Anchor from './anchor'
import { RendererOptions, Utils } from '../common'

const debug = _debug('api:render')
debug.color = 6 // Cyan

const AsyncFunction = (async () => {}).constructor

export default class Renderer extends Anchor {
  constructor (options) {
    super()

    this.options = RendererOptions.from(options)
    this.routers = []

    debug.enabled = this.options.debug
  }

  add (name, router, mountpath = '/') {
    if (router === undefined) {
      router = name
      name = 'default'
    }

    if (this.routers[name] !== undefined) {
      throw new Error(`Router name '${name}' was already registered`)
    }

    if (typeof router.mountpath === 'string') {
      throw new Error(`Router '${name}' has already mounted at '${router.mountpath}'`)
    }

    router.mountpath = mountpath
    router.name = name
    this.routers[name] = router
    this.routers.push(router)
  }

  remove (name) {
    if (this.routers[name] !== undefined) {
      const index = this.routers.findIndex(r => r.name === name)

      this.routers[name].mountpath = null
      this.routers[name].name = null

      delete this.routers[name]
      if (index >= 0) {
        this.routers.splice(index, 1)
      }
    }
  }

  async handle (req, res, next) {
    const paths = decodeURI(req.url).split('/')
    const iterators = this.routers.map(r => ({ it: r.iterator(req, res), depth: 0, router: r }))

    // TODO Temporary
    req.params = req.params || []

    let i = 0

    // TODO Temporary
    let currentFilename

    /* istanbul ignore else */
    if (debug.enabled) {
      debug(chalk`{red ${Utils.currentTime()}} {cyan ${req.method}} {green ${(req.baseUrl + (req.url === '/' ? '' : req.url)) || '/'}}`)
    }

    try {
      do {
        const path = paths[i]

        for (let iterator of iterators) {
          if (iterator.depth < i) { continue }

          const middlewares = iterator.it.next(path)

          if (middlewares === null) { continue }

          iterator.depth += 1

          if (middlewares.length < 1) { continue }

          let nextProps = null

          for (let middleware of middlewares) {
            this._handleNextProps(nextProps)

            const handle = middleware.handle
            currentFilename = middleware.filename

            // TODO Temporary
            if (middleware.type === 'parameter') {
              req.params[middleware.name] = middleware.value
            }

            if (typeof handle !== 'function') { continue }
            // TODO Remove `ignore` exports
            if (handle.ignore) { continue }

            let handler

            switch (middleware.type) {
              case 'middleware':
                handler = new Promise(resolve => handle(req, res, resolve))
                break
              case 'parameter':
                handler = new Promise(resolve => handle(req, res, resolve, middleware.value))
                break
            }

            const racer = this._handleTimeout(middleware)
            if (racer) {
              handler = Promise.race([handler, racer])
            }

            // TODO Temporary
            nextProps = await handler
          }

          this._handleNextProps(nextProps)
        }
      } while (++i < paths.length)

      for (let iterator of iterators) {
        if (iterator.depth < i) { continue }

        const responser = iterator.it.final(req.method)

        if (responser === null) { continue }

        const handle = responser.handle
        currentFilename = responser.filename

        // TODO `checkTimeout` and `createRacer`
        const racer = this._handleTimeout(responser)
        let handler

        handler = handle(req, res)

        if (handle instanceof AsyncFunction) {
          if (racer) {
            handler = Promise.race([handler, racer])
          }
          // TODO Do not support next-properties in Responser
          this._handleNextProps(await handler)
        }

        break
      }
    } catch (err) {
      if (err instanceof Error) {
        // TODO Implement Catcher
        Utils.printError(err, currentFilename)
        return finalhandler(req, res)(err)
      } else {
        let error = err
        if (typeof err === 'number') {
          error = { status: err }
        }
        return finalhandler(req, res)(error)
      }
    }

    if (!res.headersSent) {
      next()
    }
  }

  // TODO Implement next-properties
  _handleNextProps (props) {
    if (props) {
      // TODO Temporary throw directly
      props.status = props.status || 500
      throw props
    }
  }

  // TODO Move to plugin
  _handleTimeout (middleware) {
    const timeout = (typeof middleware.handle.timeout === 'number' ? middleware.handle.timeout : this.options.defaultTimeout)

    if (timeout === 0) {
      const err = new Error(`Timeout === 0\n    at (${middleware.filename}:1:1)`)
      err.status = 408
      err.filename = middleware.filename
      throw err
    } else if (timeout > 0) {
      return new Promise(resolve => setTimeout(() => {
        resolve({
          status: 408,
          message: `Error: Timeout exceeds given value \`${timeout}\`\n    at (${middleware.filename}:1:1)`
        })
      }, timeout))
    }
  }
}
