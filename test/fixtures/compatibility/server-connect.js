const connect = require('connect')
const dynapi = require('../../../index')

module.exports = function createServer () {
  const app = connect()

  app.use(dynapi({
    dev: false,
    watch: false,
    router: {
      srcdir: 'test/fixtures/compatibility',
      routesdir: 'routes'
    }
  }))

  return new Promise(resolve => {
    setTimeout(() => resolve(app), 2000)
  })
}
