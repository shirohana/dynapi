const express = require('express')
const dnp = require('../../index')
const bodyParser = require('body-parser')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

const app = express()

app.use(bodyParser.json())
app.use('/api', dnp({
  router: {
    srcdir: './server',
    routesdir: './api',
    aliases: [
      { from: 'model', to: './database/models' },
      { from: 'error', to: './errors' }
    ]
  }
}))

app.listen(port, host, () => {
  console.log(`Server starts on ${host}:${port}`)
})
