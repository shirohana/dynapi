const express = require('express')
const { Dynapi, Builder } = require('../../../index')

const options = {
  dev: true,
  loose: true,
  rootDir: __dirname,
  aliases: [
    'error',
    'model',
    { from: 'utils', to: 'utils' }
  ]
}

module.exports = function createServer () {
  const app = express()
  const dynapi = new Dynapi(options)

  app.use(express.json())
  app.use('/api', dynapi.middleware())

  app.get('/api/loose-path', (req, res) => {
    res.json({ message: 'passed through dynapi' })
  })

  return new Builder(dynapi).build().then(() => app)
}
