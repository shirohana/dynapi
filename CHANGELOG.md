Changelog
=========

[Unreleased]
------------

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

[Unreleased]: https://github.com/shirohana/dynapi/compare/v0.2.1...dev
[0.2.1]: https://github.com/shirohana/dynapi/releases/tag/v0.2.1
[0.2.0]: https://github.com/shirohana/dynapi/releases/tag/v0.2.0
[0.1.0]: https://github.com/shirohana/dynapi/releases/tag/v0.1.0
