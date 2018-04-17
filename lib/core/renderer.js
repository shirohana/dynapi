import assert from 'assert'
import Anchor from './anchor'
import { RendererOptions, Utils } from '../common'

export default class Renderer extends Anchor {
  constructor (options) {
    super()
    this.options = RendererOptions.from(options)
    this.routers = []
  }

  add (name, router, /* istanbul ignore next */ mountpath = '/') {
    /* istanbul ignore else */
    if (this.options.dev) {
      assert.equal(this.routers[name], undefined, `Router name '${name}' was already registered`)
    }

    const context = {
      name: name,
      router: router,
      mountpath: mountpath,
      mountpaths: mountpath === '/' ? [''] : mountpath.split('/')
    }
    this.routers[name] = context
    this.routers.push(context)
  }

  remove (name) {
    if (this.routers[name] !== undefined) {
      const index = this.routers.findIndex(r => r.name === name)
      if (index >= 0) {
        this.routers.splice(index, 1)
      }
      delete this.routers[name]
    }
  }

  async handle (req, res, next) {
    const paths = decodeURI(req.path).split('/')
    const layers = this.routers.map(r => ({
      it: r.router.iterator(req, res),
      depth: 0,
      router: r.router,
      mountpaths: r.mountpaths
    }))

    // TODO Temporary
    req.params = req.params || []

    let i = 0
    let error
    try {
      do {
        const path = paths[i]

        for (let layer of layers) {
          if (layer.depth < i) { continue }

          const { mountpaths } = layer

          // Calculate mountpath and fetch middlewares
          let middlewares
          if (i < mountpaths.length) {
            if (path === mountpaths[i]) {
              if (i + 1 < mountpaths.length) {
                middlewares = []
              } else {
                layer.router.anchor('request', req, res)
                middlewares = layer.it.next('')
              }
            } else {
              middlewares = null
            }
          } else {
            middlewares = layer.it.next(path)
          }

          if (middlewares === null) { continue }

          layer.depth += 1

          if (middlewares.length < 1) { continue }

          let nextProps = null

          for (let middleware of middlewares) {
            this._handleNextProps(nextProps)

            const { handle } = middleware

            // TODO Temporary
            if (middleware.type === 'parameter') {
              req.params[middleware.name] = middleware.value
            }

            if (typeof handle !== 'function') { continue }

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
            /* istanbul ignore else */
            if (racer) {
              handler = Promise.race([handler, racer])
            }

            // TODO Temporary
            nextProps = await handler
          }

          this._handleNextProps(nextProps)
        }
      } while (++i < paths.length)

      for (let layer of layers) {
        if (layer.depth < i) { continue }

        const responser = layer.it.final(req.method)

        if (responser === null) { continue }

        const { handle } = responser

        let handler = handle(req, res)

        if (handler instanceof Promise) {
          const racer = this._handleTimeout(responser)
          /* istanbul ignore else */
          if (racer) {
            handler = Promise.race([handler, racer])
          }
          await handler
        }

        break
      }
    } catch (err) {
      const catcherLayers = this.generateCatcherLayers(layers, i)
      error = this.handleError(err, req, res, catcherLayers)
    }

    if (!res.headersSent) {
      next(error)
    }
  }

  // Recursive callback style to prevent create pending Promises
  handleError (err, req, res, layers) {
    if (!err || layers.length === 0) {
      // Returns on no Error or no Catcher
      return err
    }

    let catcher

    // Find the expect catcher to invoke
    while (!catcher && layers.length > 0) {
      // Drop exhausted layers
      if (layers[0].length === 0) {
        layers.splice(0, 1)
      }

      // Get catcher from the first item of first layer
      catcher = layers[0] && layers[0].splice(0, 1)[0]
      if (!catcher) { continue }

      // Check should we invoke this Catcher
      let { name, handle } = catcher
      if (typeof handle !== 'function') {
        catcher = null
        continue
      }

      // Check statuCode in filename
      let status = ~~name
      if (400 <= status && status < 600) {
        let errStatus = (typeof err === 'number' ? err : err.status || err.statusCode)
        if (errStatus === status) {
          break
        } else {
          catcher = null
          continue
        }
      }

      // Check Error instance
      let { catches } = handle
      if (catches) {
        if (Utils.isInstance(err, catches)) {
          break
        } else if (Array.isArray(catches) &&
            catches.findIndex(proto => Utils.isInstance(err, proto)) > -1) {
          break
        } else {
          catcher = null
          continue
        }
      }
    }

    // If no catcher to handle error
    if (!catcher) {
      return err
    }

    const { handle } = catcher
    try {
      let error = err
      const next = (err) => { this.handleError(err = error, req, res, layers) }
      handle(err, req, res, next)
    } catch (err) {
      // If catcher throws an error, drop the whole layer
      layers.splice(0, 1)
      return this.handleError(err, req, res, layers)
    }
    // Receives here mean all error were catched, returns undefined
  }

  /**
   * @return Array<Array<Catcher>>
   */
  generateCatcherLayers (layers, i) {
    const catcherLayers = []

    do {
      // May used in future
      const catcherLayer = []

      // Push catcher to layer if has
      for (let layer of layers.reverse()) {
        if (layer.depth < i) { continue }
        const { mountpaths } = layer
        let catchers
        if (mountpaths.length > 1 && i < mountpaths.length) {
          catchers = null
        } else {
          catchers = layer.it.errorHandlers
          layer.it.goBack()
        }
        if (catchers === null) { continue }
        layer.depth -= 1
        if (catchers.length < 1) { continue }
        catcherLayer.push(catchers)
      }

      // Push layer to layers
      if (catcherLayer.length > 0) {
        catcherLayers.push(...catcherLayer)
      }
    } while (--i >= 0)

    return catcherLayers
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
      return new Promise((resolve, reject) => setTimeout(() => {
        const error408 = new Error(`Error: Timeout exceeds given value \`${timeout}\`\n    at (${middleware.filename}:1:1)`)
        error408.status = 408
        reject(error408)
      }, timeout))
    }
  }
}
