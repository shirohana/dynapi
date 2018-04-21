const express = require('express')
const dynapi = require('../../../index')

function createServer () {
  const app = express()
  const routers = []

  // Normal route
  routers.push({
    routesdir: 'route-basic'
  })

  // Route with complex routefile name
  routers.push({
    root: '/complex',
    routesdir: 'route-complex'
  })

  // Route with alias
  routers.push({
    root: '/user',
    routesdir: 'route-alias',
    aliases: [
      'models'
    ]
  })

  // Request timeout
  routers.push({
    root: '/racer',
    routesdir: 'route-racer'
  })

  // Custom Builder plugin
  routers.push({
    root: '/builder-plugins',
    routesdir: 'route-builder-plugin',
    build: {
      plugins: ['@babel/plugin-proposal-pipeline-operator']
    }
  })

  // Catcher test
  routers.push({
    root: '/catcher',
    routesdir: 'route-catcher',
    aliases: [
      { from: 'error', to: './catcher-errors' }
    ]
  })

  app.use(dynapi({
    debug: false,
    rootdir: __dirname,
    srcdir: 'server',
    routers: routers
  }))
  return new Promise(resolve => setTimeout(() => resolve(app), 2000))
}

module.exports = createServer
