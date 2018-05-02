import assert from 'assert'
import { resolve } from 'path'

const RendererOptions = {}

export default RendererOptions

/**
 * defaultTimeout: 800
 * dev: process.env.NODE_ENV !== 'production'
 * rootdir: process.cwd()
 */
RendererOptions.from = function (opt) {
  const options = Object.assign({}, RendererOptions.defaults, opt)

  // Helper function
  const hasValue = (v) => v && typeof v === 'string'

  options.rootdir = hasValue(opt.rootdir) ? resolve(opt.rootdir) : RendererOptions.defaults.rootdir

  // Final check
  if (RendererOptions.defaults.dev) {
    assert.equal('boolean', typeof options.dev)
    assert.equal('number', typeof options.defaultTimeout)
    assert.equal('string', typeof options.rootdir)
  }

  Object.freeze(options)
  return options
}

RendererOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  defaultTimeout: 800,
  rootdir: process.cwd()
}
