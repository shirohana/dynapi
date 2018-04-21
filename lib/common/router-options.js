import assert from 'assert'
import { join, resolve } from 'path'
import Utils from './utils'

const ALIAS_KEY_REGEX = new RegExp('([^/]+)(?:/index(?:\\.[^/]*)?)?$')

const RouterOptions = {}

export default RouterOptions

/**
 * dev: process.env.NODE_ENV !== 'production'
 * debug: `options.dev`
 * rootdir: process.cwd()
 * src: './'
 * entry: undefined
 * prefixes: { middleware: '>', parameter: '&', catcher: '#' }
 * extensions: ['js']
 * aliases: []
 * methods: [...]
 *
 * @extends BuilderOptions
 */
RouterOptions.from = function (opt) {
  const options = Object.assign({}, RouterOptions.defaults, opt)

  // helper functions
  const hasValue = (v) => v && typeof v === 'string'

  // Pre check
  if (RouterOptions.defaults.dev) {
    assert.equal('string', typeof opt.entry, '`entry` option of Router is required')
  }

  // Set up dirs
  options.rootdir = hasValue(opt.rootdir) ? resolve(opt.rootdir) : RouterOptions.defaults.rootdir
  options.src = resolve(options.rootdir, options.src)
  options.entry = resolve(options.src, opt.entry)

  // Transform aliases
  const aliases = {}
  if (Array.isArray(opt.aliases)) {
    opt.aliases.forEach(alias => {
      const type = typeof alias
      let from, to
      /* istanbul ignore else */
      if (type === 'string') {
        const match = alias.match(ALIAS_KEY_REGEX)
        /* istanbul ignore else */
        if (match) {
          [from, to] = [match[1], alias]
        } else {
          throw new SyntaxError('Cannot resolve alias:', alias)
        }
      } else if (type === 'object') {
        [from, to] = [alias.from, alias.to]
      } else {
        throw new TypeError('Unsupported alias format:', alias)
      }
      aliases[from] = join(options.src, to)
    })
  }

  aliases[''] = options.src
  options.aliases = aliases

  // Internal prefixes
  Object.assign(options.prefixes, {
    responser: Symbol('~'),
    unknown: Symbol('!')
  })

  // Internal properties
  options.filenamePattern = Utils.generateFilenameRegexp(options)

  Object.freeze(options)

  return options
}

RouterOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  rootdir: process.cwd(),
  src: './',
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
