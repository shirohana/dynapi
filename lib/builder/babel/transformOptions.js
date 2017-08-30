import presetES2015 from 'babel-preset-es2015'
import transformAsyncToGenerator from 'babel-plugin-transform-async-to-generator'
import transformRuntime from 'babel-plugin-transform-runtime'

const TransformOptions = {}

export default TransformOptions

TransformOptions.from = function (builder) {
  const options = builder.options

  // TODO Improve compiled codes
  const preset = presetES2015.buildPreset({}, { modules: 'commonjs' })

  return {
    ast: false,
    babelrc: false,
    comments: true,
    env: {},
    plugins: [
      transformAsyncToGenerator,
      transformRuntime,
      ...preset.plugins
    ],
    sourceRoot: options.rootDir
  }
}
