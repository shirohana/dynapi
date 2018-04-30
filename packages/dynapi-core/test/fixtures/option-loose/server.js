const connect = require('connect')
const dynapi = require('../../../lib')
const finalhandler = require('finalhandler')

function createServer (opt) {
  const app = connect()

  app.use(dynapi.factory({
    loose: !!opt.loose,
    rootdir: __dirname,
    router: {
      entry: './routes'
    }
  }))

  app.use((req, res, next) => {
    if (['GET', 'POST'].includes(req.method)) {
      res.write('Responsed from the next middleware')
      res.end()
    } else {
      next()
    }
  })

  app.use((req, res) => {
    finalhandler(req, res)()
  })

  return new Promise(resolve => setTimeout(() => resolve(app), 2000))
}

module.exports = createServer
