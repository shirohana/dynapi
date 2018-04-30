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

  Object.freeze(options)
  return options
}

DynapiOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  loose: false
}
