const TransformOptions = {}

export default TransformOptions

/**
 * build: {
 *   plugins: []
 * }
 * rootdir: ''
 */
TransformOptions.from = function (opt) {
  const options = {
    ast: true,
    babelrc: false,
    comments: true,
    env: {},
    presets: [
      ['@babel/preset-env', {
        targets: { node: 'current' }
      }]
    ],
    sourceRoot: opt.rootdir
  }

  if (typeof opt.build === 'object') {
    /* istanbul ignore else */
    if (Array.isArray(opt.build.plugins)) {
      options.plugins = (options.plugins || []).concat(opt.build.plugins)
    }
  }

  return options
}
