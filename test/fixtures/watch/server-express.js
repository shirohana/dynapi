const express = require('express')
const { Dynapi, Watcher } = require('../../../index')

const options = {
  dev: true,
  rootDir: __dirname,
  routesDir: 'api',
  aliases: [
    'controller/model'
  ]
}

module.exports = function createServer () {
  const port = process.env.dynapi_test_port
  const host = process.env.dynapi_test_host || '127.0.0.1'

  const dynapi = new Dynapi(options)
  const watcher = new Watcher(dynapi)

  return watcher.watch().then(() => {
    const app = express()

    app.use('/api', dynapi.middleware())

    const server = app.listen(port, host)
    server.dynapi = dynapi
    server.watcher = watcher

    return server
  })
}
