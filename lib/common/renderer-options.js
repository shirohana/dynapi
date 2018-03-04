import assert from 'assert'

const RendererOptions = {}

export default RendererOptions

/**
 * dev: process.env.NODE_ENV !== 'production'
 * defaultTimeout: 800
 */
RendererOptions.from = function (opt) {
  const options = Object.assign({}, RendererOptions.defaults, opt)

  assert(typeof options.dev === 'boolean')
  assert(typeof options.defaultTimeout === 'number')

  Object.freeze(options)

  return options
}

RendererOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  defaultTimeout: 800
}
