import { Dynapi } from './core'
import { Builder } from './builder'

/* istanbul ignore next */
function dynapiFactory (options = {}) {
  const dynapi = new Dynapi(options)

  if (dynapi.options.dev) {
    const builder = new Builder(dynapi)
    builder.watch()
  } else {
    if (dynapi.checkGenerated() === false) {
      const { red } = require('chalk')
      // eslint-disable-next-line no-console
      console.error(red(`> API files does not generated. Please do '> dynapi generate' before using in production mode.`))
      process.exit(1)
    }
  }

  return dynapi.middleware()
}

export default dynapiFactory
