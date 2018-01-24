## Example - working with mongoose

### Install

##### Using NPM
```
$ npm install
```

##### Using Yarn
```
$ yarn
```

### Start server

##### Using NPM
```
$ npm run dev
```

##### Using Yarn
```
$ yarn dev
```

##

### Key point

You need to delete cached models and schemas to ensure `mongoose` will re-compile your
changes, or ``OverwriteModelError: Cannot overwrite `User` model once compiled.`` would be thrown.

```javascript
if (process.env.NODE_ENV !== 'production') {
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
▾ server/
  ▾ api/
  | ▾ user/
  | |   >check-body.js
  | |   delete(:username).js
  | |   post.js
  | |   postVerify.js
  | ▾ users/
  | |  get.js
  ▾ database/
  | ▾ models/
  | |   user.js
  | | db.js
  ▾ errors/
  |   bad-request.js
  |   wrong-password.js
  |   user-not-found.js
  index.js
  package.json
  README.md
```
