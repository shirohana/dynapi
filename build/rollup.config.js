import rollupBabel from 'rollup-plugin-babel'
import rollupCommonJS from 'rollup-plugin-commonjs'
import rollupNodeResolve from 'rollup-plugin-node-resolve'

const packageJson = require('../package.json')
const dependencies = Object.keys(packageJson.dependencies)

export default {
  entry: 'lib/index.js',
  dest: 'dist/dynapi.js',
  format: 'cjs',
  external: ['fs', 'path'].concat(dependencies),
  sourceMap: true,
  plugins: [
    rollupNodeResolve(),
    rollupCommonJS(),
    rollupBabel({
      exclude: 'node_modules/**',
      plugins: [
        ['transform-runtime', { 'helpers': false, 'polyfill': false }],
        'transform-async-to-generator'
      ],
      presets: [
        'babel-preset-es2015-rollup'
      ]
    })
  ]
}
