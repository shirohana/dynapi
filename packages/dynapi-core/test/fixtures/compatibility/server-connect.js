const connect = require('connect')
const dynapi = require('../../../lib')

module.exports = function createServer () {
  const app = connect()

  app.use(dynapi.factory({
    dev: false,
    rootdir: __dirname,
    router: {
      entry: './routes'
    }
  }))

  return new Promise(resolve => {
    setTimeout(() => resolve(app), 2000)
  })
}
