import _ from 'lodash'

const isValid = /^[a-z]+([-_]?[A-Za-z0-9]+)*(\.js)?$/
const isSimple = /^[a-z]+(\.js)?$/

function flattenRouteFile (_filename) {
  const filename = _filename.replace(/\.js$/, '') // Remove extension

  if (isSimple.test(filename)) {
    return filename
  }

  return filename
    .replace(/^([a-z]+)(.*)$/, (_, method, paths) => `${paths}/${method}`) // Split method and paths
    .replace(/-/g, '/') // Route separate pattern
    .replace(/[_:]/g, '/:') // Params pattern
}

export function parseKeys (_filename) {
  const paths = _filename.split('/')
  let filename = paths.splice(-1, 1)[0]

  if (!isValid.test(filename)) {
    return []
  }

  filename = flattenRouteFile(filename)

  return paths.concat(filename.split('/'))
    .filter(v => v.length)
    .map(key => (/^[_:]/.test(key) ? `:${key.slice(1)}` : _.kebabCase(key)))
}

export function createRoute ({ path, fullpath = path, param, middleware, methods = {}, children = {}, paramChildren = {} }) {
  return { path, fullpath, param, middleware, methods, children, paramChildren }
}

export function createMiddleware ({ filename }) {
  return { filename }
}

export function createMethod ({ filename }) {
  return { filename }
}

export function createParam ({ name, filename }) {
  return { name, filename }
}

export function ensureRoutes (root, keys) {
  if (keys.length === 0) { return root }

  let parent = root
  keys.forEach(key => {
    const type = key.startsWith(':') ? 'paramChildren' : 'children'

    parent = (parent[type][key] = parent[type][key] || createRoute({
      path: key,
      fullpath: (parent.fullpath === '/' ? `/${key}` : `${parent.fullpath}/${key}`)
    }))
  })

  return parent
}

export function parseRouteName (url) {
  return url.replace(/[/:]/g, '_')
}
