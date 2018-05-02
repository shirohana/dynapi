const connect = require('connect')
const dynapi = require('dynapi')
const pluginIngorePaths = require('../../lib')

function createServer (opt = {}) {
  const app = connect()

  app.use(dynapi.factory({
    rootdir: __dirname,
    router: {
      entry: './routes',
      plugins: [
        opt.ignore ? pluginIngorePaths(opt.ignore) : null
      ].filter(Boolean)
    }
  }))

  return new Promise(resolve => setTimeout(() => resolve(app), 2000))
}

module.exports = createServer
