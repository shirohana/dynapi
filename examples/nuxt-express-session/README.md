## Example of using with Nuxt.js and express-session

### Install dependencies

```
$ yarn install
```

### Start server

```
$ yarn dev
```

### Key point

```javascript
app.use(dnp({
  routesDir: 'routes',
  loose: true,
  aliases: [],
  ignorePaths: [
    // Resources of Nuxt.js
    /^\/_nuxt\//,
    '/__webpack_hmr'
  ]
}))
```

### Project structure

```
</nuxt-express-session/
▾ layouts/
    default.vue
▾ pages/
    auth.vue
    index.vue
▾ routes/
  ▾ api/user/
    ▾ login/
        >check-body.js
        post.js
    ▾ logout/
        post.js
  ▾ auth/
      >redirect-if-signed.js
    >0-init.js
    >1-redirect-if-no-signed.js
  index.js
  nuxt.config.js
  package.json
  README.md
```

### Preview video

[![Example of using Nuxt.js and express-session with dynapi][thumbnail]][video]

[video]: https://www.youtube.com/watch?v=_rFyt7cDQic
[thumbnail]: https://img.youtube.com/vi/_rFyt7cDQic/0.jpg

### Links

- [Nuxt.js](https://nuxtjs.org/)
- [express-session](https://github.com/expressjs/session)
