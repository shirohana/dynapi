Dynapi
======

[![npm](https://img.shields.io/npm/v/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Travis](https://img.shields.io/travis/shirohana/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Codecov](https://img.shields.io/codecov/c/github/shirohana/dynapi/dev.svg)](https://codecov.io/gh/shirohana/dynapi/branch/dev)
[![license](https://img.shields.io/npm/l/dynapi.svg)](https://www.npmjs.com/package/dynapi)

> A dynamic routes rendering middleware for Express/Connect
>
> Never shy to send me an issue or pr, in English or Chinese is better (๑ơ ω ơ)

Features
--------

Dynapi watches all files inside your `routesDir` (default: `./api`) and update renderer according
to your routesDir structure immediatly.

For example, the file structure below:

```
</project/
▾ api/
  ▾ users/
  |   get.js               // GET /users
  |   post(:userId).js     // POST /users/:userId
  |   &userId.js           // Specify :userId must match /\d+/
  ▾ weather/
  | ▾ :country/
  |     get.js             // GET /weather/:country
  getFlights(:from-:to).js // GET /flights/:from-:to
  >check-api-key.js        // Middleware to ckeck user identifier
  &country.js              // Specify :country in parent route
```

will be rendered to:

| Method | URL                 |
| ------ | ------------------- |
| GET    | /users              |
| POST   | /users              |
| GET    | /weather/:country   |
| GET    | /flights/:from-:to  |

For more information, please checkout our [Changelog][changelog] (until homepage completed) or
[examples](#examples).

- [x] `ES6`, `async-await` supported
- [x] Intuitive, super easy to use
- [x] Complex filename rules (`getUser(:userId).js -> GET /user/:userId`)
- [x] Friendly debug message
- [x] Pending requests until builded
- [x] Prevent response blocked in codes (global timeout and local timeout)
- [x] High configurability

Links
-----

<!-- Uncompleted yet - [Documentation](https://dynapi.shirohana.me) -->
- [Changelog](changelog)

Getting started
---------------

### Install

```
$ npm install dynapi --save
```

### Plug to server

```javascript
const dnp = require('dynapi')
app.use('/api', dnp())
```

### Enable debug messages

```javascript
if (process.env.NODE_ENV !== 'production') {
  process.env.DEBUG = 'api:*'
}
```

Examples
--------

- [Basic](https://github.com/shirohana/dynapi/tree/dev/examples/hello-world)
- [RESTful API with Lowdb](https://github.com/shirohana/dynapi/tree/dev/examples/restful-lowdb)

[github]: https://github.com/shirohana/dynapi
[changelog]: https://github.com/shirohana/dynapi/blob/dev/CHANGELOG.md
