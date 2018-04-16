process.env.DEBUG = 'api:*'

const express = require('express')
const bodyParser = require('body-parser')
const dnp = require('../../index')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

const app = express()

app.use(bodyParser.json())

app.use('/', dnp({
  loose: true,
  router: {
    srcdir: '.',
    routesdir: './api',
    aliases: [
      'database/model' // Resolve ~model/ to <srcdir>/database/model/
    ]
  }
}))

app.get('*', (req, res) => {
  res.status(400).send('Bad request')
})

app.all('*', (req, res) => {
  res.status(400).end()
})

app.listen(port, host, () => {
  console.log(`Server starts on ${host}:${port}`)
})
