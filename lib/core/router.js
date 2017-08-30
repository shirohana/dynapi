import { join } from 'path'
import { Utils } from 'common'

export default class Router {
  constructor (renderer) {
    this.renderer = renderer
    this.options = renderer.options

    this.routes = {}
  }

  calculate (method, url) {
    const routes = []
    const keys = url.slice(1).split('/').filter(v => v.length)

    let parent = this.routes

    // Root middleware
    if (typeof parent.middleware === 'object') {
      routes.push(Object.assign({
        type: 'middleware',
        handler: this.renderer.handlers[parent.middleware.filename]
      }, parent.middleware))
    }

    let pageNotFound = keys.some((key) => {
      if (typeof parent.children[key] === 'object') {
        parent = parent.children[key]
      } else {
        const paramKeys = Object.keys(parent.paramChildren)

        const paramFound = paramKeys.some((paramKey) => {
          const paramRoute = parent.paramChildren[paramKey]

          if (typeof paramRoute.param === 'object') {
            const handler = this.renderer.handlers[paramRoute.param.filename]
            const { pattern } = handler

            if (typeof pattern === 'undefined' || (pattern instanceof RegExp && pattern.test(key))) {
              parent = paramRoute
              return true // route found
            }
          } else {
            parent = paramRoute
            return true // route found
          }
        })

        if (!paramFound) {
          return true // route not found
        }
      }

      if (typeof parent.param === 'object') {
        routes.push(Object.assign({
          type: 'param',
          value: key,
          handler: this.renderer.handlers[parent.param.filename]
        }, parent.param))
      }

      if (typeof parent.middleware === 'object') {
        routes.push(Object.assign({
          type: 'middleware',
          handler: this.renderer.handlers[parent.middleware.filename]
        }, parent.middleware))
      }
    })

    if (!pageNotFound && typeof parent.methods[method] === 'object') {
      routes.push(Object.assign({
        type: 'method',
        handler: this.renderer.handlers[parent.methods[method].filename]
      }, parent.methods[method]))
    } else {
      pageNotFound = true
    }

    return pageNotFound ? null : routes
  }

  // TODO Load generated routes file
  load (_routes) {

  }

  generate (files) {
    const root = Utils.createRoute({ path: '/' })

    files.forEach((file) => {
      const keys = Utils.parseKeys(file)
      const paths = keys.slice(0, -1)
      const type = keys.slice(-1)[0].toLowerCase()

      const filename = join(this.options.buildApiDir, file)

      if (type === 'middleware') {
        const middleware = Utils.createMiddleware({ filename })
        Utils.ensureRoutes(root, paths).middleware = middleware
      } else if (type === 'param') {
        const paramKey = paths.slice(-1)[0]

        if (paramKey[0] !== ':') {
          // eslint-disable-next-line no-console
          console.error('> Invalid param file: ' + file)
        } else {
          Object.assign(Utils.ensureRoutes(root, paths), {
            param: Utils.createParam({ filename, name: paramKey.substring(1) })
          })
        }
      } else {
        const priority = this.options.methods.indexOf(type)

        if (priority < 0) {
          // eslint-disable-next-line no-console
          console.error('> Ignored type file: ' + file)
        } else {
          let method = Utils.createMethod({ filename })
          Utils.ensureRoutes(root, paths).methods[type.toUpperCase()] = method
        }
      }
    }) /* End of files.forEach */

    return (this.routes = root)
  }
}
