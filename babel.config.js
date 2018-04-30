'use strict'

module.exports = function (api) {
  const envOptions = envOptionsOf(api.env())
  const enableCoverage = process.env.BABEL_COVERAGE === 'true'
  const convertESM = true

  return {
    comments: false,
    presets: [['@babel/env', envOptions]],
    plugins: [
      convertESM ? ['@babel/transform-modules-commonjs', { loose: false }] : null,
      enableCoverage ? 'babel-plugin-istanbul' : null
    ].filter(Boolean)
  }
}

function envOptionsOf (env) {
  const options = {
    loose: true,
    modules: false
  }

  switch (env) {
    case 'production':
      options.targets = {
        node: 8
      }
      break

    case 'development':
      options.debug = true
      options.targets = {
        node: 'current'
      }
      break

    case 'test':
      options.targets = {
        node: 'current'
      }
  }

  return options
}
