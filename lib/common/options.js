import _ from 'lodash'
import { join, resolve } from 'path'

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
  options.buildDir = join(options.rootDir, options.buildDirname)
  options.modulesDir = join(options.rootDir, options.modulesDirname)

  return options
}

Options.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  buildDirname: '.dynapi',
  apiDirname: 'api',
  controllerDirname: 'controller',
  modulesDirname: 'node_modules',
  responseTimeout: 800,
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
