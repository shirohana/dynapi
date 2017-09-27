import { Dynapi } from './core'
import { Builder, Watcher } from './builder'

/* istanbul ignore next */
function dynapiFactory (options = {}) {
  const dynapi = new Dynapi(options)

  if (dynapi.options.dev) {
    const watcher = new Watcher(dynapi)
    watcher.watch()
  } else {
    const builder = new Builder(dynapi)
    builder.build()
  }

  return dynapi.middleware()
}

export default dynapiFactory
