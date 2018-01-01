const connect = require('connect')
const { Dynapi, Builder } = require('../../../index')

const options = {
  dev: true,
  rootDir: __dirname
}

module.exports = function createServer () {
  const app = connect()
  const dynapi = new Dynapi(options)

  app.use('/api', dynapi.middleware())

  return new Builder(dynapi).build().then(() => app)
}
