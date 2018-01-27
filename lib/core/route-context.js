import { Utils, objectValues } from '../common'

export default class RouterContext {
  constructor () {
    this.root = new Route({ path: '/' })
  }

  ensure (paths) {
    if (paths.length === 0) {
      return this.root
    } else {
      return paths.reduce((parent, path) => {
        return parent.getChild(path) || new Route({ path, parent })
      }, this.root)
    }
  }

  find (paths) {
    if (paths.length === 0) {
      return this.root
    } else {
      let route = this.root

      for (let path of paths) {
        if ((route = route.getChild(path)) === null) {
          break
        }
      }

      return route
    }
  }

  prepare () {
    this.root.prepare()
  }

  bake () {
    this.root.bake()
  }
}

class Route {
  constructor ({ path, parent = null }) {
    this.path = path
    this.parent = parent

    this.fullpath = (parent === null ? path : (parent.fullpath === '/' ? '' : parent.fullpath) + `/${path}`)

    this.middlewares = []
    this.parameters = {}
    this.responsers = {}

    this.subRoutes = {}
    this.subParamRoutes = {}

    this.isPreparing = false

    const params = Utils.paramsOfPath(path)
    if (params.length > 0) {
      this.params = params
      this.params.forEach(name => this.parameter._touch(name))
    }

    if (this.parent !== null) {
      this.parent[params.length > 0 ? 'subParamRoutes' : 'subRoutes'][path] = this
      this.isPreparing = this.parent.isPreparing
    }
  }

  getChild (path) {
    return this.subRoutes[path] || this.subParamRoutes[path] || null
  }

  clean () {
    ['isPreparing', '_c', '_m', '_p', '_r'].forEach(key => delete this[key])

    const routes = [...objectValues(this.subRoutes), ...objectValues(this.subParamRoutes)]
    routes.forEach(route => route.clean())
  }

  prepare () {
    this.isPreparing = true

    const routes = [...objectValues(this.subRoutes), ...objectValues(this.subParamRoutes)]
    routes.forEach(route => route.prepare())
  }

  bake () {
    const routes = [...objectValues(this.subRoutes), ...objectValues(this.subParamRoutes)]
    routes.forEach(route => route.bake())

    if (this.isPreparing) {
      this.isPreparing = false
      const keys = ['_m', '_p']
      keys.forEach(key => this[key] && this[key]._touch())
    }
  }

  get middleware () {
    return this._m ? this._m : (this._m = {
      _ms: {},
      set: (key, value) => {
        this._m._ms[key] = value
        this._m._touch()
      },
      unset: (key) => {
        if (this._m._ms[key]) {
          delete this._m._ms[key]
          this._m._touch()
        }
      },
      _touch: () => {
        if (!this.isPreparing) {
          this.middlewares.length = 0
          this.middlewares.push(...Object.keys(this._m._ms).sort().map(key => this._m._ms[key]))
        }
      }
    })
  }

  get parameter () {
    return (this._p = this._p || {
      set: (key, value) => {
        this.parameters[key] = value
        this._p._touch(key)
      },
      unset: (key) => {
        /* istanbul ignore else */
        if (this.parameters[key]) {
          delete this.parameters[key]
          this._p._touch(key)
        }
      },
      _touch: (key) => {
        if (this.isPreparing) {
          return
        }

        if (key === undefined) {
          Object.keys(this.parameters).forEach(key => this._p._touch(key))
          return
        }

        if (this.params && this.params.includes(key)) {
          this.params[key] = null

          let route = this
          do {
            if (route.parameters[key]) {
              this.params[key] = route.parameters[key]
              break
            }
          } while ((route = route.parent) !== null)

          this.pattern = Utils.pathToRegexp(this.path, this.params)
        }

        objectValues(this.subParamRoutes).forEach(route => route.parameter._touch(key))
      }
    })
  }

  get responser () {
    return this._r ? this._r : (this._r = {
      set: (key, value) => (this.responsers[key] = value),
      unset: (key) => delete this.responsers[key]
    })
  }
}
