const http = require('http')
const dynapi = require('../../../index')

module.exports = function createServer () {
  const app = http.createServer(dynapi({
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
