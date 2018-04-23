Dynapi
======

[![npm](https://img.shields.io/npm/v/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Travis](https://img.shields.io/travis/shirohana/dynapi.svg)](https://www.npmjs.com/package/dynapi)
[![Codecov](https://img.shields.io/codecov/c/github/shirohana/dynapi/dev.svg)](https://codecov.io/gh/shirohana/dynapi/branch/dev)
[![license](https://img.shields.io/npm/l/dynapi.svg)](https://www.npmjs.com/package/dynapi)

> A powerful WYSIWYG routes generator

Links
-----

- :closed_book: [Changelog][changelog]

Features
--------

Create a dynamic generating API server according to your __directory structure__, with your favorite
front-end frameworks and amazing features we provided.

- [x] Directory structure based routing
- [x] Powerful flow control (using `throw` and `next(props)`)
- [x] ESNext support
- [x] Customizable transform plugins
- [x] Complex parameter support (e.g. `/flights/:from-:to` and you can specify patterns of `:from` and
  `:to`, or custom validator)
- [x] Customizable middleware prefixes
- [ ] More builders (`JavaScript`, `TypeScript`, `CoffeeScript`, etc.)

How it works
------------

First, we use file watcher to track changes of files and record which file was imported from the
target, then transform the files into executable Nodejs module.

Of course it's not all, we create a router according to `filename` and `dirname`, then generate
middleware chains to handle different requests.

Getting started
---------------

```
npm install dynapi
```

Set up your server application like: (Install `connect` or `express` in your consider)

##### server/index.js

```javascript
const express = require('express') // or 'connect'
const dynapi = require('dynapi')

const app = express()
app.use('/api', dynapi({
  watch: process.env.NODE_ENV !== 'production',
  router: {
    src: './server',
    entry: './api',
    debug: { prefix: 'api', color: 207 }
  }
}))

app.listen(3000, () => {
  console.log('Server starts listening on localhost:3000')
})
```

After that, populate `./server/api/get.js` inside your project:

##### server/api/get.js
```javascript
export default (req, res) => {
  // If you're using express
  if (res.json) {
    res.json({ message: 'Hello, world!' })
  } else {
    const body = JSON.stringify({ message: 'Hello, world' })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Length', Buffer.byteLength(body))
    res.end(body)
  }
}
```

And then start your server:

```
node server/index.js
```

Open page in browser [http://localhost:3000/api](http://localhost:3000/api)

__or__ Execute command `curl -v http://localhost:3000/api`

__or__ Use requesting tools like [Postman](https://www.getpostman.com):

<p align="center">
<img alt="postman example" align="center" src="https://i.imgur.com/guA10u9.png">
</p>

[github]: https://github.com/shirohana/dynapi
[changelog]: https://github.com/shirohana/dynapi/blob/dev/CHANGELOG.md

Examples
--------

- [Basic](https://github.com/shirohana/dynapi-example-basic)
