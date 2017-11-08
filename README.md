Dynapi
======

[![npm](https://img.shields.io/npm/v/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Travis](https://img.shields.io/travis/shirohana/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Codecov](https://img.shields.io/codecov/c/github/shirohana/dynapi/dev.svg)](https://codecov.io/gh/shirohana/dynapi/branch/dev)
[![license](https://img.shields.io/npm/l/dynapi.svg)](https://www.npmjs.com/package/dynapi)

> A dynamic routes rendering middleware for Express/Connect

Features
--------

Dynapi watches all files inside your `routesDir` (default: `./api`) and update renderer according
to your routesDir structure immediatly.

- [x] `ES6`, `async-await` supported
- [x] Intuitive, super easy to use
- [x] Complex filename rules (`getUser(:userId).js -> GET /user/:userId`)
- [x] Friendly debug message
- [x] Pending requests until builded
- [x] Prevent response blocked in codes (global timeout and local timeout)
- [x] High configurability

For more information, please checkout our [Changelog][changelog] (until homepage completed) and
[examples](#examples).

Links
-----

<!-- Uncompleted yet - [Documentation](https://dynapi.shirohana.me) -->
- [Changelog][changelog]

Getting started
---------------

### Install

```
$ npm install dynapi --save
```

### Plug to server

```javascript
const dnp = require('dynapi')
app.use('/api', dnp({ /* Options */ }))
```

### Enable debug messages

When `options.dev` is true, dynapi always shows debug messages, I don't sure should it appears
here...

```javascript
if (process.env.NODE_ENV !== 'production') {
  process.env.DEBUG = 'api:*'
}
```

### What can `dynapi` do for you?

Let me show you, this is a simple example for only two route path:

| Method | Path                  | Description         |
| ------ | ----                  | -----------         |
| `GET`  | `/api/user/:username` | Accept all requests |
| `POST` | `/api/user/:username` | Deny request if the user of `:username` is belongs to a admin |

but we have to do:

- specify `:username` format,
- check is user exists, and
- check user is a admin if requested in `POST` method.

This is how the project looks like:

```
</project/
  ▾ api/user/
  |   &username.js  // (Parameter) check is user exists from requested :username
  | ▾ :username/
  | |   >check-admin.js // (Middleware) check is user a admin when POST
  | |   get.js
  | |   post.js
  ▾ server/database/
    ▾ models/
    |   user.js   // User model (won't implemented)
    | db.js
    server.js     // Our application
```

#### Set up server

For first, we need to create a simple server with dynapi:

###### server.js

```javascript
const express = require('express')
const dnp = require('dynapi')

const app = express()

app.use('/api', dnp({
  aliases: [
    { from: 'model', to: 'server/database/models' }
  ]
}))

app.listen(3000)
```

Pretty simple, we just create an express instance and plug dynapi onto it.
Let's talk about options.

Use `aliases` can help you import modules easier. For example, you set up the `aliases` like
the example above, it will resolves imports like: (`/` relative from `srcDir`)

| Prefix    | Resolved to               |
| ------    | -----------               |
| `~/`      | `/` (Built in)            |
| `~model/` | `/server/database/models` |

#### Create methods (Responser)

##### api/user/:username/get.js

```javascript
export default (req, res) => {
  res.json({ user: req.user })
}
```

##### api/user/:username/post.js

```javascript
export default (req, res) => {
  res.json({ user: req.user })
}
```

#### Fetch the user (Parameter)

###### api/user/:username.js

```javascript
import User from '~model/user'

export const pattern = /^[a-z][a-zA-Z0-9_]{5,}$/

// Only if the part of `:username` matched the pattern, the method will be invoked
export default (req, res, next, username) => {
  const user = User.findOne({ username })

  if (!user) {
    return res.sendStatus(404)
  }

  req.user = user
  next()
}
```

#### Check is user a admin (Middleware)

###### api/user/:username/>check-admin.js

```javascript
// `req.user` was already set
export default (req, res, next) => {
  if (req.method === 'GET') {
    return next()
  }

  if (req.user.is_admin) {
    return res.sendStatus(403)
  }

  next()
}
```

#### What's next

You can find more examples below, and welcome to provide yours!

If these examples are not enough to you, or if you got any question, never shy to send me an issue (๑ơ ω ơ)

Options
-------

| Property          | Type                | Default                                           | Description |
| ---               | ---                 | ---                                               | --- |
| `dev`             | Boolean             | process.env.NODE_ENV !== 'production'             | If true, dynapi watches `routesDir` and rebuild if any changes. Else dynapi will only build once when started. |
| `rootDir`         | String              | process.cwd()                                     | The project root. Normally is where your `package.json` and `node_modules` is. |
| `srcDir`          | String              | `rootDir`                                         | The root directory of your source code. Your relative requirings and aliases is relative from here. |
| `routesDir`       | String              | 'api'                                             | The root of routes flies. Dynapi will generate routes from this directory. |
| `loose`           | Boolean             | false                                             | If true, dynapi will call `next()` when requested path does not trigger `res.end` after all handler executed. |
| `aliases`         | Array&lt;String \| Object&gt; | []                                      | Shorten your require paths. |
| `responseTimeout` | Number              | 800 (ms)                                          | How much time can spend on each middleware. |
| `symbol`          | Object              | { middleware: '>', parameter: '&', catcher: '#' } | To distinguish which file is `Middleware`, `Parameter` and `Responser`. |
| `methods`         | Array&lt;String&gt; | See [here][methods]                               | Only listed methods will be generate to routes. |

[methods]: https://github.com/shirohana/dynapi/blob/dev/lib/common/options.js#L57-L82

Examples
--------

- [Basic](https://github.com/shirohana/dynapi/tree/dev/examples/hello-world)
- [With `express-session`](https://github.com/shirohana/dynapi/tree/dev/examples/express-session)
- [RESTful API with Lowdb](https://github.com/shirohana/dynapi/tree/dev/examples/restful-lowdb)
- [With `Nuxt.js` and `express-session`](https://github.com/shirohana/dynapi/tree/dev/examples/nuxt-express-session)
- [With `mongoose`](https://github.com/shirohana/dynapi/tree/dev/examples/with-mongoose)

[github]: https://github.com/shirohana/dynapi
[changelog]: https://github.com/shirohana/dynapi/blob/dev/CHANGELOG.md
