const express = require('express')
const session = require('express-session')
const dnp = require('../../index')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

const app = express()

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use('/static', express.static(__dirname + '/static'))

app.use(dnp({
  loose: true,
  router: {
    srcdir: '.',
    routesdir: './routes'
  }
}))

// Missed path
app.get('*', (req, res) => {
  res.render('view-count', { path: req.path })
})

app.listen(port, host, () => {
  console.log(`Server starts on ${host}:${port}`)
})
