import assert from 'assert'

const DynapiOptions = {}

export default DynapiOptions

/**
 * dev: process.env.NODE_ENV !== 'production'
 * loose: false
 *
 * @extends RendererOptions
 */
DynapiOptions.from = function (opt) {
  const options = Object.assign({}, DynapiOptions.defaults, opt)

  // Final check
  if (DynapiOptions.defaults.dev) {
    assert.equal('boolean', typeof options.dev)
    assert.equal('boolean', typeof options.loose)
  }

  Object.freeze(options)
  return options
}

DynapiOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  loose: false
}
