import { existsSync } from 'fs'
import { join } from 'path'
import Tapable from 'tappable'
import nrequire from 'native-require'
import { Options } from 'common'

export default class Dynapi extends Tapable {
  constructor (_options = {}) {
    super()

    this.options = Options.from(_options)
    this.nativeRequire = nrequire.from(this.options.rootDir)
  }

  middleware () {
    return async (req, res, next) => {
      await this.renderer.renderRoute(req.path, {req, res})

      // TODO Custom user handling
      if (!res.headersSent) {
        res.sendStatus(404)
      }
    }
  }

  checkGenerated () {
    return existsSync(join(this.options.buildDir, 'index.js'))
  }

  async close (callback) {
    await this.applyPluginsAsync('close')

    if (typeof callback === 'function') {
      await callback()
    }
  }

  // Only allowed resolve from `node_modules` and `aliases` this time
  resolve (type, name) {
    if (name === undefined) {
      [name, type] = [type, '']
    }

    if (name.startsWith('.')) {
      throw new SyntaxError('Unsupport resolving relative modules yet.')
    }

    // Resolve from node_modules (rootDir)
    if (!name.startsWith('.') && !name.startsWith('~')) {
      return this.nativeRequire.resolve(name)
    }

    type = name.slice(1, name.indexOf('/'))
    const alias = `~${type}/`

    if (name.startsWith(alias)) {
      name = name.slice(alias.length)
    }

    return this.nativeRequire.resolve(join(this.options.srcDir, type, name))
  }
}
