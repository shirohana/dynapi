@dynapi/plugin-debug [![npm](https://img.shields.io/npm/v/@dynapi/plugin-debug.svg)](https://www.npmjs.com/package/@dynapi/plugin-debug)
====================

> Prints useful debug messages.

Installation
------------

```
npm install @dynapi/plugin-debug
```

Usage
-----

#### Via `dynapi.factory`
##### server/index.js
```javascript
app.use(dynapi.factory({
  router: {
    plugins: [
      ['debug', {
        enabled: true,
        prefix: 'request',
        color: 3
      }]
    ]
  }
}))
```

Scope
-----

- `dynapi.Router`

Options
-------

### `enabled`

> Type: `boolean`
>
> Default: `process.env.NODE_ENV !== 'production'`
>
> Description: Force enable or disable this plugin manually.

### `prefix`

> Type: `string`
>
> Default: `api_${n}` which `n` is auto-increased number starts at 1
>
> Description: Namespace of [`debug`](https://github.com/visionmedia/debug).

### `color`

> Type: `number`
>
> Default: default color generated from [`debug`](https://github.com/visionmedia/debug#namespace-colors)
>
> [![CheetSheet](https://i.imgur.com/vAJFNvy.png)](https://i.imgur.com/vAJFNvy.png)
