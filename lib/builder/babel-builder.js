import assert from 'assert'
import { dirname, join } from 'path'
import Module from 'module'
import { Script } from 'vm'
import { transformFileSync } from '@babel/core'
import traverse from '@babel/traverse'
import glob from 'glob'
import Builder from './builder'
import BabelTransformOptions from './babel-transform-options'
import { Utils } from '../common'

const ALLOWED_EXTENSIONS = ['js']

export default class BabelBuilder extends Builder {
  constructor (router) {
    super()

    this.declareAnchors('sequence', [
      ['beforeFetch', 'filename'],
      ['afterFetch', 'filename', 'exports'],
      ['afterTransform', 'filename', 'result']
    ])

    this.router = router
    this.transformOptions = BabelTransformOptions.from(this.router.options)

    this.extensions = ALLOWED_EXTENSIONS.filter(v => this.router.options.extensions.includes(v))

    /* istanbul ignore else */
    if (this.router.options.dev) {
      assert(this.extensions.length >= 1, `BabelBuilder can't handle any file extension of given Router`)
    }

    // Absolute filename to exports
    this.handles = {}
  }

  require (request, filename) {
    if (request[0] === '~' || request[0] === '.') {
      return this.fetch(this.router.resolve(request, filename))
    } else {
      return this.router.require(request)
    }
  }

  fetch (filename) {
    this.anchor('beforeFetch', filename)

    let exports = this.handles[filename]

    if (exports === undefined) {
      try {
        const result = this.transform(filename)
        exports = result.exports

        if (filename.startsWith(this.router.options.routesdir)) {
          if (typeof exports !== 'function' && typeof exports !== 'object') {
            throw new Error(`Default export should be a function or an object\n    at (${filename}:1:1)`)
          }
        }
      } catch (err) {
        err.filename = filename
        Utils.printError(err)
        exports = Builder.getBuildFailureHandle(err)
      }

      this.handles[filename] = exports
    }

    this.anchor('afterFetch', filename, exports)

    return exports
  }

  async build () {
    const exts = this.extensions.join(',')
    const routeFiles = glob.sync(`**/*.@(${exts})`, {
      cwd: this.router.options.routesdir,
      nodir: true
    })

    this.router.context.prepare()

    routeFiles.map(filename => {
      const fullpath = join(this.router.options.routesdir, filename)
      const exports = this.fetch(fullpath)

      this.router.set(filename, exports)
    })

    this.router.context.bake()
    this.router.context.clean()
  }

  transform (filename) {
    const compileOptions = { filename, displayErrors: true }

    // Transpile file to ES5 code
    const transformed = transformFileSync(filename, this.transformOptions)

    // Compile code to executable module with wrapper
    const wrapper = Module.wrap(transformed.code)
    const script = new Script(wrapper, compileOptions)
    const compiledWrapper = script.runInThisContext(compileOptions)

    // Container for module exports
    const m = { exports: {} }

    // Require helper
    const requirer = (request) => this.require(request, filename)

    // Execute wrapper and fetch exports to container (exports, require, module, __filename, __dirname)
    compiledWrapper(m.exports, requirer, m, filename, dirname(filename))

    // Extract default exports from babel transpilations
    const exports = m.exports && m.exports.default ? m.exports.default : {}
    delete m.exports.default
    Object.assign(exports, m.exports)

    const result = {
      exports: exports,
      source: transformed,
      get imports () {
        let imports = []
        traverse(transformed.ast, {
          CallExpression: {
            enter ({ node }) {
              if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
                imports.push(node.arguments[0].value)
              }
            }
          }
        })
        return imports
      }
    }

    this.anchor('afterTransform', filename, result)

    return result
  }
}
