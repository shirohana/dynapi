import _ from 'lodash'

const isValid = /^[a-z]+([-_]?[A-Za-z0-9]+)*(\.js)?$/
const isSimple = /^[a-z]+(\.js)?$/

export function isFilenameValid (filename) {
  return isValid.test(filename)
}

export function isFilenameSimple (filename) {
  return isSimple.test(filename)
}

export function parseKeys (_filename) {
  const paths = _filename.split('/')
  const filename = paths.splice(-1, 1)[0]

  if (!isFilenameValid(filename)) {
    return []
  }

  let keys = filename.replace(/\.js$/, '') // Remove extension

  if (!isFilenameSimple(filename)) {
    keys = keys
      .replace(/([A-Z])/, '-$1') // Split method and first path
      .replace(/_/g, '-_') // Params pattern
  }

  keys = keys
    .split('-')
    .filter((key) => key.length !== 0)
    .map((key) => (key.startsWith('_') ? ':' + _.snakeCase(key) : _.kebabCase(key)))

  return _.concat(
    paths.map((key) => (key.startsWith('_') ? `:${_.snakeCase(key)}` : _.kebabCase(key))),
    keys.slice(1),
    keys.slice(0, 1)
  )
}

export function createRoute ({ name = '', path, fullpath = path, param, middleware, methods = {}, children = [] }) {
  return { name, path, fullpath, param, middleware, methods, children }
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
  keys.forEach((key) => {
    const child = _.find(parent.children, { path: key })
    if (child) {
      parent = child
    } else {
      const fullpath = (parent.fullpath === '/' ? `/${key}` : `${parent.fullpath}/${key}`)
      const newRoute = createRoute({
        name: parseRouteName(fullpath),
        path: key,
        fullpath
      })
      parent.children.push(newRoute)
      parent = newRoute
    }
  })

  return parent
}

export function parseRouteName (url) {
  const keys = url.split('/').slice(1)
  return keys
    .map((key) => (key.startsWith(':') ? `_${key.substring(1).toLowerCase()}` : key.toLowerCase()))
    .join('_')
}
