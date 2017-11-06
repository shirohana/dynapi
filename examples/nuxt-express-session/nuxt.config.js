module.exports = {
  build: {
    postcss: {
      plugins: {
        'postcss-custom-properties': false // Set for bulma
      }
    }
  },
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  router: {
    linkActiveClass: 'is-active'
  },
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/bulma'
  ]
}
