const http = require('http')
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
  const app = http.createServer(dynapi(options))

  return new Promise(resolve => {
    setTimeout(() => resolve(app), 2000)
  })
}
