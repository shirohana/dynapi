import { join, resolve } from 'path'
import rollupBabel from 'rollup-plugin-babel'
import rollupCommonJS from 'rollup-plugin-commonjs'

const packageJson = require('../package.json')
const dependencies = Object.keys(packageJson.dependencies)

const rootDir = resolve(__dirname, '..')
const lib = (...args) => join(rootDir, 'lib', ...args)
const dist = (...args) => join(rootDir, 'dist', ...args)

export default {
  input: lib('index.js'),
  output: {
    file: dist('dynapi.js'),
    format: 'cjs',
    sourcemap: true
  },
  external: ['assert', 'fs', 'path', 'module', 'vm'].concat(dependencies),
  plugins: [
    rollupCommonJS(),
    rollupBabel({
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: false
        }]
      ],
      env: {
        test: {
          plugins: ['istanbul']
        }
      }
    })
  ]
}
