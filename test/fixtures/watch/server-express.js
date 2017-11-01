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
  const dynapi = new Dynapi(options)
  const watcher = new Watcher(dynapi)

  const app = express()

  app.use('/api', dynapi.middleware())

  app._watcher = watcher
  return watcher.watch().then(() => app)
}
