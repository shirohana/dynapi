process.env.DEBUG = 'api:*'

const express = require('express')
const bodyParser = require('body-parser')
const dnp = require('dynapi')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const dnpOptions = {
  aliases: [
    'database/model' // Resolve ~model/ to ~/database/model/
  ]
}

const app = express()

app.use(bodyParser.json())
app.use('/', dnp(dnpOptions))

app.listen(port, host, () => {
  console.log(`Server starts on ${host}:${port}`)
})
