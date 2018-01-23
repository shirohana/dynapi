const express = require('express')
const dynapi = require('../../../index')

const options = {
  dev: true,
  loose: true,
  watch: false,
  router: {
    srcdir: 'test/fixtures/build',
    routesdir: 'api',
    aliases: [
      'error',
      'model',
      { from: 'utils', to: 'utils' }
    ]
  }
}

module.exports = function createServer () {
  const app = express()

  app.use(express.json())
  app.use('/api', dynapi(options))

  app.get('*', (req, res) => {
    res.json({ message: 'passed through dynapi' })
  })

  return new Promise(resolve => {
    setTimeout(() => resolve(app), 2000)
  })
}
