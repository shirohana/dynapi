import assert from 'assert'

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
  options.plugins = options.plugins || []

  options.watch = (typeof options.watch === 'boolean' ? options.watch : options.dev)

  if (typeof options.router === 'object') {
    options.routers.push(options.router)
    delete options.router
  }

  Object.freeze(options)

  return options
}

FactoryOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production'
}
