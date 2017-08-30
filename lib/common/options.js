import _ from 'lodash'
import { join, resolve } from 'path'

const aliasKeyPattern = new RegExp('^(?:[^/]+/?)*?([^/]+?)(?:/?index)?(?:.js)?/?$')

const Options = {}

export default Options

Options.from = function (_options) {
  const options = Object.assign({}, _options)

  _.defaultsDeep(options, Options.defaults)

  // Resolve dirs
  const hasValue = (v) => v && typeof v === 'string'
  options.rootDir = hasValue(options.rootDir) ? resolve(options.rootDir) : process.cwd()
  options.srcDir = hasValue(options.srcDir) ? join(options.rootDir, options.srcDir) : options.rootDir

  // Computed dirs
  options.apiDir = join(options.srcDir, options.apiDirname)
  options.controllerDir = join(options.srcDir, options.controllerDirname)
  options.modulesDir = join(options.rootDir, options.modulesDirname)

  // Internal dirs
  options.buildDir = join(options.rootDir, options.buildDirname)
  options.buildApiDir = join(options.buildDir, 'api')
  options.buildControllerDir = join(options.buildDir, 'controller')

  // Transform aliases
  options.alias = options.aliases.reduce((result, _alias) => {
    if (typeof _alias === 'string') {
      let key = _alias.match(aliasKeyPattern)[1]
      result[key] = join(options.srcDir, _alias)
    } else if (typeof _alias === 'object') {
      result[_alias.from] = join(options.srcDir, _alias.to)
    }
    return result
  }, { '': options.srcDir })

  delete options.aliases

  return options
}

Options.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  buildDirname: '.dynapi',
  apiDirname: 'api',
  baseUrl: process.env.npm_package_dynapi_baseUrl,
  controllerDirname: 'controller',
  modulesDirname: 'node_modules',
  responseTimeout: 800,
  aliases: [],
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
