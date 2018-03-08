import assert from 'assert'
import { join, resolve } from 'path'
import Utils from './utils'

const ALIAS_KEY_REGEXP = new RegExp('([^/]+)(?:/index(?:\\.[^/]*)?)?/?$')

const RouterOptions = {}

export default RouterOptions

/**
 * dev: process.env.NODE_ENV !== 'production'
 * debug: `options.dev`
 * rootdir: process.cwd()
 * srcdir: undefined
 * routesdir: undefined
 * prefixes: { middleware: '>', parameter: '&', catcher: '#' }
 * extensions: ['js']
 * aliases: []
 * methods: [...]
 * build: {
 *   plugins: [String]
 * }
 */
RouterOptions.from = function (opt) {
  const options = Object.assign({}, RouterOptions.defaults, opt)

  // helper functions
  const hasValue = (v) => v && typeof v === 'string'

  // Check necessary options
  assert(hasValue(options.srcdir))
  assert(hasValue(options.routesdir))

  assert.equal(typeof options.prefixes, 'object')
  assert(hasValue(options.prefixes.middleware))
  assert(hasValue(options.prefixes.parameter))
  assert(hasValue(options.prefixes.catcher))

  // Set up dirs
  options.rootdir = hasValue(options.rootdir) ? resolve(options.rootdir) : process.cwd()
  options.srcdir = join(options.rootdir, options.srcdir)
  options.routesdir = join(options.srcdir, options.routesdir)

  // Transform aliases
  const aliases = {}
  if (Array.isArray(options.aliases)) {
    options.aliases.forEach(alias => {
      switch (typeof alias) {
        case 'string':
          const [, key] = alias.match(ALIAS_KEY_REGEXP)
          aliases[key] = join(options.srcdir, alias)
          break

        case 'object':
          aliases[alias.from] = join(options.srcdir, alias.to)
          break

        /* istanbul ignore next */
        default:
          throw new TypeError('Unsupported alias value:', alias)
      }
    })
  }
  aliases[''] = options.srcdir
  options.aliases = aliases

  // Internal prefixes
  // TODO Check need these or not
  options.prefixes.responser = Symbol('~')
  options.prefixes.unknown = Symbol('!')

  // Internal properties
  options.filenamePattern = Utils.generateFilenameRegexp(options)

  Object.freeze(options)

  return options
}

RouterOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  prefixes: {
    middleware: '>',
    parameter: '&',
    catcher: '#'
  },
  extensions: ['js'],
  methods: [
    'checkout',
    'copy',
    'delete',
    'get',
    'head',
    'lock',
    'merge',
    'mkactivity',
    'mkcol',
    'move',
    'msearch',
    'notify',
    'options',
    'patch',
    'post',
    'purge',
    'put',
    'report',
    'search',
    'subscribe',
    'trace',
    'unlock',
    'unsubscribe',
    'all'
  ]
}
