const connect = require('connect')
const dynapi = require('dynapi')

function createServer (opt = {}) {
  const app = connect()

  app.use(dynapi.factory({
    rootdir: __dirname,
    router: {
      entry: './routes',
      plugins: [
        opt.ignore ? ['ignore-paths', opt.ignore] : null
      ].filter(Boolean)
    }
  }))

  return new Promise(resolve => setTimeout(() => resolve(app), 2000))
}

module.exports = createServer
