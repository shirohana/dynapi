const production = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000
const host = process.env.HOST || '127.0.0.1'

const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const dnp = require('../../index')
const { Nuxt, Builder: NuxtBuilder } = require('nuxt')

const nuxtConfig = require('./nuxt.config.js')

const app = express()

app.use(bodyParser.json())

initSession()
initAPI()
initNuxt()

app.listen(port, host)

function initSession () {
  const sessionConfig = {
    secret: 'pied-bit-nitpick-camshaft-freeman',
    resave: false,
    saveUninitialized: false,
    cookie: {}
  }
  app.use(session(sessionConfig))
}

function initAPI () {
  app.use(dnp({
    loose: true,
    router: {
      srcdir: '.',
      routesdir: './routes'
    },
    ignorePaths: [
      /^\/_nuxt\//,
      '/__webpack_hmr'
    ]
  }))
}

function initNuxt () {
  const nuxt = new Nuxt(nuxtConfig)
  if (!production) {
    new NuxtBuilder(nuxt).build()
  }
  app.use(nuxt.render)
}

