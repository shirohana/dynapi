const connect = require('connect')
const dynapi = require('../../../index')

const options = {
  dev: true,
  watch: false,
  router: {
    srcdir: 'test/fixtures/compatibility',
    routesdir: 'api'
  }
}

module.exports = function createServer () {
  const app = connect()

  app.use('/api', dynapi(options))

  return new Promise(resolve => {
    setTimeout(() => resolve(app), 2000)
  })
}
