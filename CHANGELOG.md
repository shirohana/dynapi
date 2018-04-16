Changelog
=========

[Unreleased]
------------

### Fixed
- Fix root catchers was been ignored

[0.4.0-beta.1] - 2018-04-14
---------------------------

__:exclamation: This release contains breaking changes (see [0.4.0 Migrating](#0.4.0-migrating))__

__:exclamation: Upgrade engine: 'node >= 8.0.0'__

### Added
- :sparkles: New feature: `Catcher` (TODO: example)

- :sparkles: New feature: `plugin-support` (see [0.4.0 Plugins](#0.4.0-plugins))

- New built-in plugin: `ignore-paths` (For _Router_)

- New built-in plugin: `debug` (For _Router_)

- New _Router_ option `build.plugins` which allows custom transform plugins for _Builder_

    For example:

    ```javascript
    app.use(dynapi({
      router: {
        build: {
          plugins: ['@babel/plugin-proposal-pipeline-operator']
        }
      }
    }))
    ```

    which allows you using `pipeline-operator` in your routes.

### Changed
- :exclamation: Adjustment options of `factory` and almost internal classes (see [0.4.0 Overview](#0.4.0-overview))

### Deprecated
- Deprecate `export.ignore` property of _Responsers_, _Middlewares_ and _Parameters_

### Internal
- Remove unused code

- Change relations between classes for lower coupling

- Refactor the whole rendering algorithm

### Details
<a id="0.4.0-overview"></a>
<details><summary>Overview</summary>

  ###
  > For planning in the future, we decided to separate options from `factory` and other
  > internal classes to reduce relies on each other.

  \*Now dynapi has no default router setted. To work like before, you can just use:

  ```javascript
  const factoryOptions = {
    routers: [], // If you have more than 1 router, list them in it
    router: {
      root: '/', // Just like `app.use()`. Default '/'
      rootdir: process.cwd(),  <-------.     // Default `process.cwd()`
      srcdir: './server',    <---------|-.   // Required. Relative from `rootdir`
      routesdir: './api',   <----------|-|-. // Required. Relative from `srcdir`
      prefixes: { ... },   <--------.  | | |
      aliases: [ ... ],   <-------. |  | | |
      methods: [ ... ],  <------. | |  | | |
      plugins: [                | | |  | | |
        ['ignore-path', [...]] <|-|-|--|-|-|--.
      ],                        | | |  | | |  |
      ignore: [...],  <---------|-|-|--|-|-|--.
    },                          | | |  | | |  |
    // rootDir: process.cwd(), -|-|-|--' | |  |
    // srcDir: './server',   ---|-|-|----' |  |
    // routesDir: './api',  ----|-|-|------'  |
    // symbol: { ... },    -----|-|-'         |
    // aliases: [ ... ],  ------|-'           |
    // methods: [ ... ], -------'             |
    defaultTimeout: 800,  <----.              |
    // responseTimeout: 800  --'              |
    // ignorePaths: [...]  -------------------'
  }
  ```
</details>

<a id="0.4.0-plugins"></a>
<details><summary>Plugins support</summary>

  ###
  > Since we think it (dynapi) should only do one simple thing: Route rendering, we moved some
  > features that they're not always necessary from the core to `plugins`, to keep the core purely.

  These removed features were rewrote as multiple `plugins` and they're still shipped with `dynapi`
  as `built-in plugins`.

  PLugins can be installed in two ways:

  ##### Use `plugins` options
  ```javascript
  app.use('/', dynapi({
    plugins: [
      ['serve-static', 'public/ftp', { index: ['index.html', 'index.htm'] }]
    ]
  }))
  ```

  ##### Use alias (built-in plugins only)
  ```javascript
  app.use('/', dynapi({
    statics: [
      ['public/ftp', { root: '/ftp', index: ['index.html', 'index.htm'] }],
      ['public/images', { root: '/images' }]
    ]
  }))
  ```

  ### Plugin `ignore-paths`
  Prevent some path pass through dynapi.

  - Type: `Array<String|RegExp>`

  Usage:
  ```javascript
  app.use('/', dynapi({
    router: {
      ...,
      ignore: ['/__webpack_hmr']
    }
  }))
  // or
  app.use('/', dynapi({
    router: {
      ...,
      plugins: [
        ['ignore-paths', ['/__webpack_hmr']]
      ]
    }
  }))
  ```

</details>

<a id="0.4.0-migrating"></a>
<details><summary>Migrating from 0.3.7</summary>

  ### 1. Rename options

  \*Pay attention to the case

  ```javascript
  app.use(dynapi({
    router: {
      rootdir,  <----------.
      srcdir,  <-----------|-.   // Use '.' if no value
      routesdir,  <--------|-|-. // Use './api' if no value
      prefixes,  <--.      | | |
      aliases,  <---|-.    | | |
      methods,  <---|-|-.  | | |
      ignore  <-----|-|-|--|-|-|--.
    },              | | |  | | |  |
    // rootDir, ----|-|-|--' | |  |
    // srcDir, -----|-|-|----' |  |
    // routesDir, --|-|-|------'  |
    // symbol,   ---' | |         |
    // aliases, ------' |         |
    // methods, --------'         |
    defaultTimeout,  <-----.      |
    // responseTimeout,  --'      |
    // ignorePaths ---------------'
  }))
  ```
</details>

[0.3.7] - 2017-12-09
--------------------

- Upgrade dependencies

[0.3.6] - 2017-11-07
--------------------

### Added
- New option: `ignorePaths`

  If the incoming request path is contains in `ignorePaths`, dynapi will pass the request to the
  next middleware directly.

  It's useful when you serving API with resources. Here is an example: [Using with Nuxt.js and
  express-session](https://github.com/shirohana/dynapi/tree/dev/examples/nuxt-express-session)

- Now you can send headers in middlewares as expected. (Like using `redirect`)

### Changed
- Now errors thrown by route files are `silent` in default when `options.dev === false` (or says
  `process.env.NODE_ENV === 'production'`)

  You can still forcing silent or not by providing it in Error object, for example:

  ```javascript
  // >check-post-data.js
  export default (req, res, next) => {
    if (typeof req.body.username === 'string') {
      return next()
    } else {
      return next({ silent: true, status: 400 }) // Always silent even in dev-mode
    }
  }
  ```

### Fixed
- Fix middlewares do not used when request path not exists in `routesDir` since `loose-mode` added

[0.3.5] - 2017-11-05
--------------------

### Changed
- Now the routefiles that transform failed will print error stack and response 500 status instead ignoring
- Improve tiny build time at startup
- Use `decodeURI` to bypass special characters

  If your request path contains any special characters, you should use `encodeURI` before requesting.

  Although HTTP has already transformed these special characters for you, but it also transforms `\\`
  to `/`. At least use `encodeURI` when request path contains a `\\`.

  ```javascript
  axios.get('/c:\\program files')
  // Received: GET /c:/program files (unexpected)
  axios.get(encodeURI('/c:\\program files'))
  // Received: GET /c:\\program files
  ```

  Note 1. Dynapi use two sequences to bypass matching a parameter beginning: `::` and `\:`

### Fixed
- Fix calling `next()` at wrong case
- Fix error stack tracing when transform failed

[0.3.4] - 2017-11-04
--------------------

### Changed
- Allow responser-less routes pass through dynapi in `loose-mode`

### Fixed
- Fix dynapi response 404 after file change since [0.3.0][0.3.0] in dev-mode

[0.3.3] - 2017-11-04
--------------------

### Added
- New option: `loose`

  If set to `true`, dynapi will invoke `next()` when requested path doesn't match any routes.
  (Default: `false`)

[0.3.2] - 2017-11-03
--------------------

### Changed
- Improve performance by using `babel-preset-env` to prevent transforming already
    implemented features depending on Node version
- De-dependent on `lodash` to minify dynapi bundle size

[0.3.1] - 2017-11-02
--------------------

### Changed
- Always enable debug message when `options.dev` is true

### Fixed
- `Object.values` and `Object.entries` doesn't works in Node:6

### Other
- Fix test cases which causes build failure before ([#05f0656][#05f0656])

[#05f0656]: https://github.com/shirohana/dynapi/commit/05f065657c034da0af2f29e48e812a65ec22c5f5

[0.3.0] - 2017-11-01
--------------------

__:exclamation: This release contains breaking changes :exclamation:__

### Added
- <details><summary>New feature :sparkles: <b>Symbol Routing</b></summary>

    You can now use symbols (customizable) to figureout Middlewares, Parameters and Catchers.

    In default, we use `>` as a Middleware, `&` as a Parameter, and `#` as a Catcher.

    ```
    // Default symbols
    options = {
      symbol: {
        middleware: '>',
        parameter: '&',
        catcher: '#'
      }
    }
    ```

    Here's some example:

    ```
    </project/
      ▾ api/
        >check-api-token.js
        >log-access.js
        ▾ user/
          &userId.js    // export pattern = /\d+/
          &username.js  // export pattern = /[a-zA-Z][a-zA-Z0-9_]{,15}/
          >check-user-exists.js
          ▾ :userId/
          | get.js      // GET /api/user/:userId  <-- pass through (check-api-token -> log-access
          |                             -> &userId -> check-user-exists -> get)
          ▾ :username/
            get.js      // GET /api/user/:username  <-- pass through (check-api-token -> log-access
                                        -> &username -> check-user-exists -> get)
    ```

    Note 1. Old format (`middleware.js` and `param.js`) was no longer supported, but you
      can still use these by seting `options.symbol` to `{ middlewares: 'middleware', parameter: 'param' }`

    Note 2. Catcher is not implemented yet, but choose a symbol to use first seems not a bad idea :)

  </details>

- <details><summary>Multiple middlewares supported</summary>

    Since symbol-routering has been added, you can attach multiple middlewares into the same route.

    Middlewares in the same level will be ordered in increasing order by filename,
    you can put a order number in front of the filename to ensure they were invoked as expected order.

    For example:
    ```
    </project/
      ▾ api/
        ▾ photos/
          >b01.js
          post.js   // POST /api/ptohos  <-- pass through (a01 -> a02 -> b01 -> post)
        >a01.js
        >a02.js
        get.js      // GET /api  <-- pass through (a01 -> a02 -> get)
    ```
  </details>

- Complex param route supported (like `/flights/:from-:to`)

### Changed
- Now routes with params (`/user/:id`) will search the nearest param file (`&id.js`) in its parents
- Improve performance
- <details><summary>Change rules of complex Responser filename</summary>

    A filename of Responser is starts with a method name and allowed following 0+ subpath(s).
    Here's the rules:

    - Use `()` surround every subpaths
    - Only the first subpath can wrote without `()` but it will be transform to kebab-case
    - Double or escape the colon can match a plain colon

    Examples:

    ```
    get.js               -> GET /
    getUserProfile.js    -> GET /user-profile
    getUser:userId.js    -> GET /user-user-id (Not expected)
    getUser(:userId).js  -> GET /user/:userId
    get(:id).js          -> GET /:id
    get(commit:::shasum) -> GET /commit:(:shasum) e.g. /commit:b790638
    ```
  </details>

### Fixed
- Fix `req.params` was undefined when no param file provided

[0.2.1] - 2017-09-26
--------------------

### Changed
- Disable polyfill of transformations ([#25a44ae](https://github.com/shirohana/dynapi/commit/25a44ae82e6029abf489cd178465e56ef6310036))

### Fixed
- Default value of `req.params` ([#edaff91](https://github.com/shirohana/dynapi/commit/edaff91e824b230fdaf3074fb13458b02f199705))

[0.2.0] - 2017-09-06
--------------------

### Added
- :sparkles: Custom aliases

```javascript
const options = {
  aliases: [
    'db/model', // Resolve `~model` from {srcDir}/db/model
    { from: 'error', to: 'src/server/error' }, // Resolve `~error` from {srcDir}/src/server/error
    'lib/utils/index.js' // Resolve `~utils` from {srcDir}/lib/utils/index.js
  ]
}
// Then you can use
import User from '~model/user'
import SomeError from '~error/some-error'
import { kebabCase } from '~utils'
// You can still use `~/` to resolve from {srcDir}
```

- :sparkles: Dynamic watcher

By default, `Watcher` watches all files in `routesDir` and files imported by them, requests will pending until all related files build done.

- Complete test cases
- Use [Travis CI](https://travis-ci.org/shirohana/dynapi) for code integration
- Use [nyc](https://github.com/istanbuljs/nyc) and [Codecov](https://codecov.io/gh/shirohana/dynapi/branch/dev) for code coverage

### Changed
- :scissors: Extract implicit `watch()` from `Builder.build()` when `dev:true`

```javascript
// Before => dev:true ? watch() : build()
import { Builder } from 'dynapi'
new Builder(dynapi).build().then(...)

// Now => Use `Watcher` if you want to watch, use `Builder` if you just want to build once on start up
import { Builder, Watcher } from 'dynapi'
new Watcher(dynapi).watch().then(...)
new Builder(dynapi).build().then(...)

// No difference to use dynapi.middleware
app.use('/api', dynapi.middleware())
```

- :wrench: Options (`apiDirname` -> `routesDir`)
- Internal refactoring, it would break your code if you're using:
  - Dynapi#resolve
  - Dynapi#relativeFrom
  - Dynapi#redirectTo

### Removed
- Drop options `controllerDirname` (use `aliases`)

[0.1.0] - 2017-08-25
--------------------

### Added
- :sparkles: Prototype of [Dynapi][github]
- Use [Rollup](https://github.com/rollup/rollup) for bundling
- Use [AVA](https://github.com/avajs/ava) for unit-test

[github]: https://github.com/shirohana/dynapi
[npm]: https://www.npmjs.com/package/dynapi

[Unreleased]: https://github.com/shirohana/dynapi/compare/v0.4.0-beta.1...dev
[0.4.0-beta.1]: https://github.com/shirohana/dynapi/releases/tag/v0.4.0-beta.1
[0.3.7]: https://github.com/shirohana/dynapi/releases/tag/v0.3.7
[0.3.6]: https://github.com/shirohana/dynapi/releases/tag/v0.3.6
[0.3.5]: https://github.com/shirohana/dynapi/releases/tag/v0.3.5
[0.3.4]: https://github.com/shirohana/dynapi/releases/tag/v0.3.4
[0.3.3]: https://github.com/shirohana/dynapi/releases/tag/v0.3.3
[0.3.2]: https://github.com/shirohana/dynapi/releases/tag/v0.3.2
[0.3.1]: https://github.com/shirohana/dynapi/releases/tag/v0.3.1
[0.3.0]: https://github.com/shirohana/dynapi/releases/tag/v0.3.0
[0.2.1]: https://github.com/shirohana/dynapi/releases/tag/v0.2.1
[0.2.0]: https://github.com/shirohana/dynapi/releases/tag/v0.2.0
[0.1.0]: https://github.com/shirohana/dynapi/releases/tag/v0.1.0
