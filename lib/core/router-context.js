import { Routes, objectValues } from 'utils'

const escapeParamColonPattern = /\\\\|[\\:]:/g
const extractParamPattern = /(?::([a-zA-Z0-9_]+))?([^:]*$|[^:]+)/g
const escapePlainText = (str) => str.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&')

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
}

class Route {
  constructor ({ path, parent = null }) {
    this.path = path
    this.parent = parent

    this.fullpath = (parent === null ? path : (parent.fullpath === '/' ? '' : parent.fullpath) + `/${path}`)
    // TODO Rename to `middlewares` and provide helper function
    this._middlewares = []
    this.parameters = {}
    this.responsers = {}
    this.subRoute = {}
    this.subParamRoute = {}

    this.hasParam = Routes.hasParam(path)
    this._calculated = false

    if (this.parent !== null) {
      this.parent[this.hasParam ? 'subParamRoute' : 'subRoute'][path] = this
    }
  }

  getChild (path) {
    return this.subRoute[path] || this.subParamRoute[path] || null
  }

  calculate () {
    Route._generatePattern(this)
    this._calculated = true
  }

  get pattern () {
    if (!this._calculated) {
      this.calculate()
    }
    return this._pattern
  }

  get computedParameters () {
    if (!this._calculated) {
      this.calculate()
    }
    return this._params
  }

  // TODO Improve performance
  get middlewares () {
    return objectValues(this._middlewares).map(m => m.filepath)
  }

  get middleware () {
    return this._m ? this._m : (this._m = {
      set: (name, content) => (this._middlewares[name] = content),
      unset: (name) => delete this._middlewares[name]
    })
  }

  get parameter () {
    return (this._p = this._p || {
      set: (name, content) => {
        this.parameters[name] = content
        this._p._touch(name)
        return this.parameters[name]
      },
      unset: (name) => {
        /* istanbul ignore else */
        if (this.parameters[name]) {
          delete this.parameters[name]
          this._p._touch(name)
        }
      },
      _touch: (name) => {
        if (this._calculated && this._params[name] !== undefined) {
          this._calculated = false
        }
        objectValues(this.subParamRoute).forEach(subRoute => {
          subRoute.parameter._touch(name)
        })
      }
    })
  }

  get responser () {
    return this._r ? this._r : (this._r = {
      set: (name, content) => (this.responsers[name] = content),
      unset: (name) => delete this.responsers[name]
    })
  }

  static _generatePattern (route) {
    route._pattern = null
    route._params = []

    if (!Routes.hasParam(route.path)) {
      return route
    }

    // Preprocess the hard-to-match parts
    const escapedPaths = route.path.replace(escapeParamColonPattern, p => {
      return p[1] === ':' ? '\n' : '\\'
    }).split('\n')

    const patternString = escapedPaths.reduce((str, path) => {
      return str + path.replace(extractParamPattern, (_orig, paramName, remaining) => {
        let paramPattern = ''

        if (paramName) {
          const paramHandler = Route._findParamHandler(route, paramName)
          route._params[paramName] = paramHandler

          if (paramHandler && paramHandler.pattern.length > 0) {
            paramPattern = `(${paramHandler.pattern})`
          } else if (remaining.length > 0) {
            paramPattern = `([^${remaining[0]}]+)`
          } else {
            paramPattern = '(.+)'
          }
        }

        return paramPattern + escapePlainText(remaining)
      })
    }, '')

    route._pattern = new RegExp(`^${patternString}$`)
    return route
  }

  static _findParamHandler (route, name) {
    do {
      if (route.parameters[name]) {
        return route.parameters[name]
      }
    } while ((route = route.parent) !== null)
    return null
  }
}
