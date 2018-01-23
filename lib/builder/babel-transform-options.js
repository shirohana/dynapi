const TransformOptions = {}

export default TransformOptions

TransformOptions.from = function (options) {
  return {
    ast: false,
    babelrc: false,
    comments: true,
    env: {},
    presets: [
      ['env', {
        targets: { node: 'current' }
      }]
    ],
    sourceRoot: options.rootdir
  }
}
