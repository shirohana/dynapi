import assert from 'assert'
import { join } from 'path'
import _require from 'native-require'

const FactoryOptions = {}

export default FactoryOptions

/**
 * dev: process.env.NODE_ENV !== 'production'
 * watch: `options.dev`
 * router: undefined
 * routers: []
 */
FactoryOptions.from = function (opt) {
  const options = Object.assign({}, FactoryOptions.defaults, opt)

  assert.equal(typeof options.dev, 'boolean')

  options.routers = options.routers || []

  // Use watcher or not
  options.watch = (typeof options.watch === 'boolean' ? options.watch : options.dev)

  // Push `router` to `routers`
  if (typeof options.router === 'object') {
    options.routers.push(options.router)
    delete options.router
  }

  // Process router plugins
  options.routers.forEach(router => {
    router.rootdir = router.rootdir || options.rootdir
    router.srcdir = router.srcdir || options.srcdir
    router.plugins = router.plugins || []

    // Built-in plugin: ignore-paths
    if (router.ignore) {
      router.plugins.push(['ignore-paths', router.ignore])
    }

    // Built-in plugin: debug
    if (router.debug) {
      router.plugins.push(['debug', router.debug])
    }

    // Fill router plugins
    if (router.plugins.length > 0) {
      router.plugins = router.plugins.map(args => resolvePlugin('Router', args))
    }
  })

  Object.freeze(options)

  return options
}

FactoryOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production'
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
