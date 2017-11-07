## Example - working with mongoose

### Install

```
$ yarn
```

### Start server

```
$ yarn dev
```

### Key point

You would need to delete cached models and schemas to ensure `mongoose` will re-compile your
changes, or ``OverwriteModelError: Cannot overwrite `User` model once compiled.`` will be thrown.

```javascript
if (process.env.NODE_ENV !== 'production') {
  const realModel = mongoose.model
  mongoose.model = function (name, schema, collection) {
    delete mongoose.models[name]
    delete mongoose.modelSchemas[name]

    return realModel.call(mongoose, name, schema, collection)
  }
}
```

### Project structure

```
</examples/with-mongoose/
▾ api/
  ▾ user/
      >check-body.js
      delete(:username).js
      post.js
      postVerify.js
  ▾ users/
      get.js
▾ server/database/
  ▸ models/
    db.js
  index.js
  package.json
  README.md
```
