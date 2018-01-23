const express = require('express')
const dynapi = require('../../../index')

const options = {
  dev: true,
  watch: true,
  router: {
    srcdir: 'test/fixtures/watch',
    routesdir: 'api',
    aliases: [
      'controller/model'
    ]
  }
}

module.exports = function createServer () {
  const app = express()

  app.use('/api', dynapi(options))

  return new Promise(resolve => {
    setTimeout(() => resolve(app), 2000)
  })
}
