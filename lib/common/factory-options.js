import { join } from 'path'
import _require from 'native-require'

const FactoryOptions = {}

export default FactoryOptions

/**
 * dev: process.env.NODE_ENV !== 'production'
 * rootdir: process.cwd()
 * src: './'
 * router: undefined
 * routers: []
 * watch: false
 *
 * @extends DynapiOptions
 */
FactoryOptions.from = function (opt) {
  const options = Object.assign({}, FactoryOptions.defaults, opt)

  options.routers = (Array.isArray(opt.routers) ? opt.routers : [])
  options.watch = (typeof opt.watch === 'boolean' ? opt.watch : FactoryOptions.defaults.watch)

  // Push opt.router to options.routers
  if (typeof opt.router === 'object') {
    options.routers.push(opt.router)
  }

  // Fill router plugins
  // Will be validated by RouterOptions
  options.routers.forEach(router => {
    router.rootdir = router.rootdir || options.rootdir
    router.src = (router.src || options.src || './')
    router.plugins = router.plugins || []

    // Built-in plugin: ignore-paths
    if (router.ignore) {
      router.plugins.push(['ignore-paths', router.ignore])
    }

    // Built-in plugin: debug
    if (router.debug) {
      router.plugins.push(['debug', router.debug])
    }

    // Fetch plugins
    if (router.plugins.length > 0) {
      router.plugins = router.plugins.map(args => resolvePlugin('Router', args))
    }
  })

  Object.freeze(options)
  return options
}

FactoryOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  watch: false,
  rootdir: process.cwd(),
  router: undefined,
  routers: undefined
}

function resolvePlugin (target, args) {
  if (typeof args === 'function') {
    return args
  } else {
    const [name, ...opts] = (typeof args === 'string' ? [args] : args)
    return requirePlugin(name, target)(...opts)
  }
}

function requirePlugin (name, target) {
  let plugin

  /* istanbul ignore next */
  try {
    plugin = _require.from(join(__dirname, '../plugins')).require('./' + name)
  } catch (err) {
    plugin = _require('dynapi-plugin-' + name)
  }

  // Check can the plugin plug to the target or not
  /* istanbul ignore if */
  if (plugin.availables && !plugin.availables[target]) {
    throw new TypeError(`Plugin \`${name}\` is not available to plug to \`${target}\``)
  }

  return plugin
}
