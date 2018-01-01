import { join, resolve } from 'path'

const aliasKeyPattern = new RegExp('^(?:[^/]+/?)*?([^/]+?)(?:/?index)?(?:.js)?/?$')

const Options = {}

export default Options

Options.from = function (_options) {
  const options = Object.assign({}, Options.defaults, _options)

  // Resolve dirs
  const hasValue = (v) => v && typeof v === 'string'
  options.rootDir = hasValue(options.rootDir) ? resolve(options.rootDir) : process.cwd()
  options.srcDir = hasValue(options.srcDir) ? join(options.rootDir, options.srcDir) : options.rootDir
  options.routesDir = join(options.srcDir, options.routesDir)

  // Transform aliases
  options.aliases = options.aliases.map(alias => {
    if (typeof alias === 'string') {
      let key = alias.match(aliasKeyPattern)[1]
      return [key, join(options.srcDir, alias)]
    } else if (typeof alias === 'object') {
      return [alias.from, join(options.srcDir, alias.to)]
    }
  })
  options.aliases.push(['', options.srcDir])

  // Symbols
  options.symbol.responser = Symbol('~')
  options.symbol.unknown = Symbol('!')

  return options
}

Options.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  routesDir: 'api',
  loose: false,
  baseUrl: process.env.npm_package_dynapi_baseUrl,
  responseTimeout: 800,
  aliases: [],
  symbol: {
    middleware: '>',
    parameter: '&',
    catcher: '#'
  },
  ignorePaths: [],
  extensions: ['.js'],
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
