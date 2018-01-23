import assert from 'assert'
import { resolve } from 'path'

const DynapiOptions = {}

export default DynapiOptions

/**
 * dev: process.env.NODE_ENV !== 'production'
 * debug: `options.dev`
 * loose: false
 * rootdir: process.cwd()
 */
DynapiOptions.from = function (opt) {
  const options = Object.assign({}, DynapiOptions.defaults, opt)

  // Helper functions
  const hasValue = (v) => v && typeof v === 'string'

  // Check base options
  assert.equal(typeof options.dev, 'boolean')
  assert.equal(typeof options.loose, 'boolean')

  if (options.debug === undefined) {
    options.debug = options.dev
  }

  options.rootdir = hasValue(options.rootdir) ? resolve(options.rootdir) : process.cwd()

  return options
}

DynapiOptions.defaults = {
  dev: process.env.NODE_ENV !== 'production',
  loose: false,
  // TODO Move to plugin
  ignorePaths: []
}
