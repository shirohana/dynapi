const express = require('express')
const dynapi = require('../../../index')

function createServer () {
  const app = express()
  app.use(dynapi({
    debug: false,
    watch: false,
    rootdir: __dirname,
    srcdir: 'server',
    routers: [{
      routesdir: 'routes'
    }, {
      root: '/complex',
      routesdir: 'routes2',
    }, {
      root: '/user',
      routesdir: 'routes3',
      aliases: [
        'models'
      ]
    }, {
      root: '/racer',
      routesdir: 'routes4'
    }]
  }))
  return new Promise(resolve => setTimeout(() => resolve(app), 2000))
}

module.exports = createServer
