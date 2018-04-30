export default class RouteIterator {
  constructor (router, status) {
    this.router = router
    this.status = status
    this.root = router.context.root

    this.current = this.root
    this.queues = []
  }

  get currentMiddlewares () {
    const q = this.queues
    return q[q.length - 1][1]
  }

  get errorHandlers () {
    if (this.current === null) {
      return null
    } else {
      return this.current.catchers.map(c => ({
        type: 'catcher',
        name: c.name,
        filename: c.filename,
        handle: this.router.handles[c.filename]
      }))
    }
  }

  final (method) {
    const r = this.current && this.current.responsers[method]
    return (!r ? null : {
      type: 'responser',
      filename: r.filename,
      handle: this.router.handles[r.filename]
    })
  }

  goBack () {
    if (this.current !== null) {
      this.current = this.current.parent
    }
  }

  next (path) {
    if (this.current !== null && typeof path === 'string') {
      let args, nextRoute, queue

      // Find next route
      if (path.length === 0) {
        nextRoute = this.current
      } else {
        nextRoute = this.current.subRoutes[path] || Object.values(this.current.subParamRoutes).find(r => {
          const match = path.match(r.pattern)
          if (match) {
            args = match.slice(1)
            return true
          }
        }) || null
      }

      // Create queue of middlewares from next route
      if (nextRoute === null) {
        queue = null
      } else if (this.status.isSkipped) {
        queue = []
      } else {
        queue = []
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
      }

      this.current = nextRoute
      this.queues.push([path, queue])
    }

    return this.currentMiddlewares
  }
}
