process.env.DEBUG = 'api:*'

const express = require('express')
const dnp = require('dynapi')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

const app = express()

app.use('/api', dnp()) // Use factory function
app.use('/', express.static('./static'))

app.listen(port, host, () => {
  console.log(`Server starts on ${host}:${port}`)
})
