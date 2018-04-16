process.env.DEBUG = 'api:*'

const express = require('express')
const dnp = require('../../index')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

const app = express()

app.use('/api', dnp({
  router: {
    srcdir: '.',
    routesdir: './api'
  }
}))

app.use('/', express.static('./static'))

app.listen(port, host, () => {
  console.log(`Server starts on ${host}:${port}`)
})
