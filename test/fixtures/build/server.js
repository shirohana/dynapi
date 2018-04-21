const express = require('express')
const dynapi = require('../../../index')

function createServer () {
  const app = express()
  const routers = []

  // Normal route
  routers.push({
    entry: './route-basic'
  })

  // Route with complex routefile name
  routers.push({
    root: '/complex',
    entry: './route-complex'
  })

  // Route with alias
  routers.push({
    root: '/user',
    entry: './route-alias',
    aliases: [
      'models'
    ]
  })

  // Request timeout
  routers.push({
    root: '/racer',
    entry: './route-racer'
  })

  // Custom Builder plugin
  routers.push({
    root: '/builder-plugins',
    entry: './route-builder-plugin',
    build: {
      plugins: ['@babel/plugin-proposal-pipeline-operator']
    }
  })

  // Catcher test
  routers.push({
    root: '/catcher',
    entry: './route-catcher',
    aliases: [
      { from: 'error', to: './catcher-errors' }
    ]
  })

  app.use(dynapi({
    rootdir: __dirname,
    src: './server',
    routers: routers
  }))
  return new Promise(resolve => setTimeout(() => resolve(app), 2000))
}

module.exports = createServer
