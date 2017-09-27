const http = require('http')
const { Dynapi, Builder } = require('../../../index')

const options = {
  dev: true,
  rootDir: __dirname,
  aliases: ['error', 'model', 'utils']
}

module.exports = function createServer () {
  const port = process.env.dynapi_test_port
  const host = process.env.dynapi_test_host || '127.0.0.1'

  const dynapi = new Dynapi(options)

  return new Builder(dynapi).build().then(() => {
    const app = http.createServer(dynapi.middleware())

    return app.listen(port, host)
  })
}