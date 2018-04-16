const connect = require('connect')
const dynapi = require('../../../../index')

function createServer (opt = {}) {
  const app = connect()

  app.use(dynapi({
    debug: false,
    watch: false,
    router: {
      rootdir: __dirname,
      srcdir: '.',
      routesdir: 'routes',
      plugins: opt.plugins,
      ignore: opt.ignore
    },
  }))

  return new Promise(resolve => setTimeout(() => resolve(app), 2000))
}

module.exports = createServer
