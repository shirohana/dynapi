const express = require('express')
const dnp = require('../../index')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use('/api', dnp({
  aliases: [
    { from: 'model', to: 'server/database/models' }
  ]
}))

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.listen(port, host)
