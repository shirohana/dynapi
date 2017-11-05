const express = require('express')
const session = require('express-session')
const dnp = require('../../index')

const app = express()

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(dnp({
  routesDir: 'routes'
}))

app.use('/static', express.static(__dirname + '/static'))

// Missed path
app.get('*', (req, res) => {
  res.render('view-count', { path: req.path })
})

app.listen(3000, () => { console.log('Server started') })
