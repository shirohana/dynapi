import mongoose from 'mongoose'

const host = process.env.MONGO_HOST || process.env.HOST || '127.0.0.1'
const port = process.env.MONGO_PORT || 27017
const dbname = 'test'

// https://github.com/Automattic/mongoose/issues/5399 (´-ωก`)

mongoose.Promise = global.Promise
mongoose.connect(`mongodb://${host}:${port}/${dbname}`, { useMongoClient: true })

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

export default mongoose
