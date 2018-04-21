const express = require('express')
const dynapi = require('../../../index')

function createServer () {
  const app = express()
  app.use(dynapi({
    watch: true,
    rootdir: __dirname,
    routers: [{
      src: './server',
      entry: './routes'
    }]
  }))
  return new Promise(resolve => setTimeout(() => resolve(app), 2000))
}

module.exports = createServer
module.exports.closeAll = dynapi.Watcher.closeAll
