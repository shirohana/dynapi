import { objectValues } from '../common'

export default class RouteIterator {
  constructor (router) {
    this.router = router
    this.root = router.context.root

    this.current = this.root
    this.pathQueues = []
  }

  get currentMiddlewares () {
    const q = this.pathQueues
    return q[q.length - 1][1]
  }

  final (method) {
    const r = this.current && this.current.responsers[method]
    return (!r ? null : {
      type: 'responser',
      filename: r.filename,
      handle: this.router.handles[r.filename]
    })
  }

  next (path) {
    if (this.current !== null && typeof path === 'string') {
      let args
      let nextRoute = this.current

      if (path.length > 0) {
        nextRoute = this.current.subRoutes[path]

        // Find matched param route if not found a static path route
        if (!nextRoute) {
          for (let paramRoute of objectValues(this.current.subParamRoutes)) {
            const match = path.match(paramRoute.pattern)
            if (match) {
              args = match.slice(1)
              nextRoute = paramRoute
              break
            }
          }
        }
      }

      this.current = nextRoute || null

      // Push middlewares queue of next route
      if (this.current === null) {
        this.pathQueues.push([path, null])
      } else {
        const queue = []

        // Push param handles
        if (args) {
          const params = nextRoute.params
          queue.push(...params.map((name, index) => {
            const filename = params[name] && params[name].filename
            return {
              type: 'parameter',
              name: name,
              value: args[index],
              filename: filename,
              handle: this.router.handles[filename]
            }
          }))
        }

        // Push middleware handles
        if (nextRoute.middlewares.length > 0) {
          queue.push(...nextRoute.middlewares.map(m => ({
            type: 'middleware',
            filename: m.filename,
            handle: this.router.handles[m.filename]
          })))
        }

        this.pathQueues.push([path, queue])
      }
    }

    return this.currentMiddlewares
  }
}
