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
if (false && process.env.NODE_ENV !== 'production') {
  const realModel = mongoose.model

  mongoose.model = function (name, schema, collection) {
    if (mongoose.models[name]) {
      delete mongoose.models[name]
      delete mongoose.modelSchemas[name]
    }

    const model = realModel.call(mongoose, name, schema, collection)
    const realDiscriminator = model.discriminator

    model.discriminator = function (name, schema) {
      if (model.discriminators && model.discriminators[name]) {
        delete model.discriminators[name]
      }

      if (model.db.models[name]) {
        delete model.db.models[name]
      }

      return realDiscriminator.call(model, name, schema)
    }

    return model
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
