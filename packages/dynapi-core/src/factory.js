import { Dynapi, Router } from './core'
import { BabelBuilder, Watcher } from './builder'
import { FactoryOptions } from './common'

function dynapiFactory (opt) {
  const options = FactoryOptions.from(opt)

  // Create dynapi instance
  const dynapi = new Dynapi(opt)

  // Create routers and builders
  const builders = options.routers.map((routerOptions, index) => {
    const name = 'dynapi-factory-' + index
    const router = new Router(routerOptions)
    const root = routerOptions.root || '/'

    // Attach plugins to Router
    if (routerOptions.plugins.length > 0) {
      routerOptions.plugins.forEach(p => p(router))
    }

    dynapi.renderer.add(name, router, root)
    const builder = new BabelBuilder(router)

    return builder
  })

  // Wrap builder with watcher if `options.watch == true`
  if (options.watch) {
    builders.forEach(builder => {
      new Watcher(builder).watch()
    })
  }

  builders.forEach(builder => builder.build())

  return dynapi.middleware()
}

export default dynapiFactory
