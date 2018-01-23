import assert from 'assert'

const RendererOptions = {}

export default RendererOptions

/**
 * dev: process.env.NODE_ENV !== 'production'
 * debug: `options.dev`
 * defaultTimeout: 800
 */
RendererOptions.from = function (opt) {
  const options = Object.assign({}, RendererOptions.defaults, opt)

  assert(typeof options.dev === 'boolean')
  assert(typeof options.defaultTimeout === 'number')

  if (options.debug === undefined) {
    options.debug = options.dev
  }

  return options
}

RendererOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  defaultTimeout: 800
}
