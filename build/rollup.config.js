import { join, resolve } from 'path'
import rollupAlias from 'rollup-plugin-alias'
import rollupBabel from 'rollup-plugin-babel'
import rollupCommonJS from 'rollup-plugin-commonjs'
import rollupNodeResolve from 'rollup-plugin-node-resolve'

const packageJson = require('../package.json')
const dependencies = Object.keys(packageJson.dependencies)

const rootDir = resolve(__dirname, '..')
const lib = (...args) => join(rootDir, 'lib', ...args)
const dist = (...args) => join(rootDir, 'dist', ...args)

const aliases = {
  core: lib('core/index.js'),
  builder: lib('builder/index.js'),
  common: lib('common/index.js'),
  app: lib('app')
}

export default {
  entry: lib('index.js'),
  dest: dist('dynapi.js'),
  format: 'cjs',
  external: ['fs', 'path'].concat(dependencies),
  sourceMap: true,
  plugins: [
    rollupNodeResolve(),
    rollupCommonJS(),
    rollupAlias(Object.assign({
      resolve: ['index.js', '.js']
    }, aliases)),
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
