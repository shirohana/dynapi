Dynapi
======

[![npm](https://img.shields.io/npm/v/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Travis](https://img.shields.io/travis/shirohana/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Codecov](https://img.shields.io/codecov/c/github/shirohana/dynapi/dev.svg)](https://codecov.io/gh/shirohana/dynapi/branch/dev)
[![license](https://img.shields.io/npm/l/dynapi.svg)](https://www.npmjs.com/package/dynapi)

> A dynamic routes generator for Express/Connect

Links
-----

- [Documentation](https://dynapi.shirohana.me)
- [Changelog](https://github.com/shirohana/dynapi/blob/dev/CHANGELOG.md)

Getting started
---------------

> We assume you have enough knowledge in middleware and Express

```
$ npm install dynapi --save
```

### Install middleware

In default, Dynapi watches all files inside `/api` (configurable) and generates routes dynamically.

```javascript
// Enable rich debug messages during develop
if (process.env.NODE_ENV !== 'production') {
  process.env.DEBUG = 'api:*'
}

const dnp = require('dynapi')
// ...

app.use('/api', dnp()) // Plug to Express or Connect
```

### Write your first route

Inside your project, create `./api/getMessage.js` and fill:

```javascript
export default (req, res) => {
  // If you're using Express
  res.json({ message: 'Hello, world!' })
  // Otherwise
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ message: 'Hello, world!' }))
}
```

And then request path `/api/message` with `GET` method.

Using [axios](https://github.com/mzabriskie/axios):

```javascript
const data = await axios.get('/api/message')
assert(data.message, 'Hello, world!')
```

Using [Postman](https://www.getpostman.com/):

![Postman Example](https://i.imgur.com/kbMaJok.png)

### Let's RESTful ₍₍ (ง ˘ω˘ )ว ⁾⁾

Please take a look in [RESTful API Example](https://github.com/shirohana/dynapi/tree/dev/examples/restful-lowdb).

Examples
--------

- [Basic](https://github.com/shirohana/dynapi/tree/dev/examples/hello-world)
- [RESTful API with Lowdb](https://github.com/shirohana/dynapi/tree/dev/examples/restful-lowdb)

[github]: https://github.com/shirohana/dynapi
