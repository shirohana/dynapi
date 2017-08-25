# Dynapi
Dynamic API rendering middleware

## Getting started

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


## Documentations

{{ TODO }}

## Examples

Here's some simple examples for quick to start playing

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

## TODO

- Support middleware array
- Custom error handling
- Generate static routes for no-params routes
- Integration with Nuxt.js