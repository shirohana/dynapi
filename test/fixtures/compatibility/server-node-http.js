const http = require('http')
const { Dynapi, Builder } = require('../../../index')

const options = {
  dev: true,
  rootDir: __dirname
}

module.exports = function createServer () {
  const dynapi = new Dynapi(options)
  const app = http.createServer(dynapi.middleware())

  return new Builder(dynapi).build().then(() => app)
}
