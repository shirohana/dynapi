Dynapi
======

[![npm](https://img.shields.io/npm/v/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Travis](https://img.shields.io/travis/shirohana/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Codecov](https://img.shields.io/codecov/c/github/shirohana/dynapi/dev.svg)](https://codecov.io/gh/shirohana/dynapi/branch/dev)
[![license](https://img.shields.io/github/license/shirohana/dynapi.svg)](https://www.npmjs.com/package/dynapi)

Dynamic API rendering middleware

> :fire: Dynapi is in heavy progressing, beware to use in productions!

Getting started
---------------

```
$ npm install dynapi --save
```

And now you can plug `dynapi` as a middleware to any HTTP server

```javascript
const dynapi = require('dynapi')

// With Connect or Express.js
app.use('/api', dynapi(/* Options */))

// With Node.HTTP (It will register middleware to '/')
app = http.createServer(dynapi(/* Options */))
```

In default (dev mode), `dynapi` watches files under `/api`, and generates a dynamic routes to resolve requestings.

Links
-----

- [Postman](https://www.getpostman.com/) - An excellent graphical API tester

TODOs
-----

- [x] Make a RESTful API with Node.js never simple more than that
- [x] Easy integration with popular frameworks
- [x] Full ES6 syntax supports (also async/await)
- [x] Using `middleware`, `param`, and `method` with watcher to render routes dynamically
- [x] Custom timeout to throws an error (40x) if `middleware` or `param` didn't calls `next()` in specified time
- [x] Custom param pattern to handle different type of request
- [x] Custom alias to shorter imports
- [ ] Custom error handling in different situation
- [ ] Generate static router file in production mode
- [ ] Named `param` and `middleware`
- [ ] Complete documentation

Examples
--------

Here's some examples for preparing to play

#### Asynchronous Param Handler

```javascript
// api/user/:userId/param.js
import User from '~model/user'
import UserNotFoundError from '~error/user-not-found'

// If pattern.test(:userId) failed, request was rejected.
export const pattern = /^\d+$/

// The `id` will matching the pattern
// Works for path: /api/user/(\d+)/*
// unless it's already an async function, you can still use async keyword to use await in your code.
export default async (req, res, next, id) => {
  let user = await User.find(id)

  if (user !== undefined) {
    req.user = user
    return next()
  } else {
    // Reject the request with customizable error handler
    return next(new UserNotFoundError())
  }
}

// The handler should solved (calling next()) in 400ms, or request will be rejected.
// You can also configure a global timeout. (default: 800)
// if == 0, it will always be rejected.
// if < 0, it will waits forever until next() has been called.
export const timeout = 400
```

#### Synchronous Middleware

```javascript
// api/user/:userId/middleware.js
import PermissionDeniedError from '~error/permission-denied'

// Works for path: /api/user/(\d+)/* which passed in param.js
export default (req, res) => {
  if (req.user.isAdmin()) {
    return next()
  } else {
    return next(new PermissionDeniedError())
  }
}

// You can also ignore the single middleware/param/method in quick.
export const ignore = true
```

#### Methods shortcut

```javascript
// api/user/:userId/getProfile.js
// It will treated as /api/user/:userId/profile/get.js

// The filename can be complexed to simplify dirs in your project.
// You can find full rules in documentation. (preparing)

export default (req, res) => {
  res.json(req.user)
}
```
