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
  assert(Array.isArray(options.routers))

  options.watch = (typeof options.watch === 'boolean' ? options.watch : options.dev)

  if (typeof options.router === 'object') {
    options.routers.push(options.router)
    delete options.router
  }

  return options
}

FactoryOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  routers: []
}
