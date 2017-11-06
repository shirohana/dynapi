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

### Performance time!

Let me show what can Dynapi does for you!

This example only contains two paths:

| Method | Path                | Description        |
| ------ | ----                | -----------        |
| `GET`  | `/api/user/:userId` | Accept all request |
| `POST` | `/api/user/:userId` | Denied the request if userId is belongs to a admin |

but we have to do:

- specify `:userId` format
- check user exists
- check user is admin or not

The structure looks like:

```
</project/
▾ server/
  ▾ api/user/
  |   &userId.js  // (Parameter) check is user exists from :userId
  | ▾ :userId/
  | |   >check-admin.js // (Middleware) check is user a admin when POST
  | |   get.js    // (Responser) end the request in expected
  | |   post.js   // (Responser) end the request in expected
  ▾ controller/
    ▾ models/
        user.js   // User model (won't implemented)
    ▾ errors/
        user-not-found.js   // Thrown when user not found
        permission-denied.js  // Thrown when user is a admin
```

#### Set up server

```javascript
// <project>/server.js
const express = require('express')
const dnp = require('dynapi')

const app = express()

app.use('/api', dnp({
  srcDir: 'server',
  routesDir: 'api',
  aliases: [
    { from: 'controller/models', to: 'model'},
    { from: 'controller/errors', to: 'error' }
  ]
}))

app.listen(3000, () => { console.log('Server started') })
```

These aliases make requiring path more clear:

| Prefix    | Resolved to                   |
| ------    | -----------                   |
| `~/`      | `./server/` (Built in)        |
| `~model/` | `./server/controller/models/` |
| `~error/` | `./server/controller/errors/` |

#### Create the methods (Responser)

You should always end the response in a `Responser` or `Catcher` (in progress), send headers in
`Middleware` or `Parameter` will polluted your workflow.

```javascript
// <project>/server/api/user/:userId/get.js
export default (req, res) => {
  res.json({ user: req.user })
}
```

```javascript
// <project>/server/api/user/:userId/post.js
export default (req, res) => {
  res.json({ user: req.user })
}
```

Seems we done nothing? Logics was moved to another files ξ( ✿＞◡❛)

#### Fetch the user (Parameter)

```javascript
// <project>/server/api/user/:userId.js
import User from '~model/user'
import UserNotFound from '~error/user-not-found'

// If it took over 400ms and still not invoke next() yet,
//   reject the method chain and response with status 408.
export const timeout = 400
export const pattern = /^\d+$/

// Only `:userId` matched the pattern, the method be invoked
export default (req, res, next, userId) => {
  // `req.params.userId` was also assigned with `:userId` but both of them are String

  const user = User.find(+userId)
  if (!user)
    return next(new UserNotFound(userId))

  req.user = user
  next()
}
```

#### Check is user a admin (Middleware)

```javascript
// <project>/server/api/user/:userId/>check-admin.js
import PermissionDenied from '~error/permission-denied'

export default (req, res, next) => {
  // `req.user` has already set
  if (req.method === 'GET')
    return next()

  if (req.user.is_admin)
    return next(new PermissionDenied())

  next()
}
```

#### Error handling (Plain)

You can throw a custom error that attached some informations like response status, dynapi will
send the `status` (if have) and log the `message` with stacktrace when `options.dev` is true.

After `Catcher` implemented, you can also handle these errors thrown by `next()` by yourself.

```javascript
// <srcDir>/controller/errors/user-not-found.js
export default class UserNotFound extends Error {
  constructor (message) {
    super(message)
    this.status = 404
  }
}
```

```javascript
// <srcDir>/controller/errors/permission-denied.js
export default class PermissionDenied extends Error {
  constructor (message) {
    super(message)
    this.status = 403
  }
}
```

If you don't need the stacktraces, you can also throw a literal object like `next({ status: 403 })`.

#### What's next

You can find more examples below, and welcome to provide yours!

If these examples are not enough for you, if you got any questions, never shy to send me an issue (๑ơ ω ơ)

Options
-------

| Property          | Type                | Default                                           | Description |
| ---               | ---                 | ---                                               | --- |
| `dev`             | Boolean             | process.env.NODE_ENV !== 'production'             | If true, create a file watcher watches `routesDir` and update renderer dynamically. |
| `rootDir`         | String              | process.cwd()                                     | The project root. Normally is where your `package.json` and `node_modules` are. |
| `srcDir`          | String              | `rootDir`                                         | Your source code root directory. Used to solve relative requires and aliases. |
| `routesDir`       | String              | 'api'                                             | The root of routes flies. Dynapi will generate routes from the directory structure of `routesDir` |
| `loose`           | Boolean             | false                                             | If true, dynapi will invoke `next()` when requested path doesn't match any routes. |
| `aliases`         | Array&lt;String \| Object&gt; | []                                      | Aliases to be resolved from requires. There's a example below. |
| `responseTimeout` | Number              | 800 (ms)                                          | How much time can a middleware used. If exceeds, reject the request with status 408. |
| `symbol`          | Object              | { middleware: '>', parameter: '&', catcher: '#' } | Which symbol to used to distinguish different type of files. |
| `methods`         | Array&lt;String&gt; | See [here][methods]                               | Only listed methods would be transformed to routes. |

[methods]: https://github.com/shirohana/dynapi/blob/dev/lib/common/options.js#L57-L82

Examples
--------

- [Basic](https://github.com/shirohana/dynapi/tree/dev/examples/hello-world)
- [With `express-session`](https://github.com/shirohana/dynapi/tree/dev/examples/express-session)
- [RESTful API with Lowdb](https://github.com/shirohana/dynapi/tree/dev/examples/restful-lowdb)

[github]: https://github.com/shirohana/dynapi
[changelog]: https://github.com/shirohana/dynapi/blob/dev/CHANGELOG.md
