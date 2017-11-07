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
    delete mongoose.models[name]
    delete mongoose.modelSchemas[name]

    return realModel.call(mongoose, name, schema, collection)
  }
}

export default mongoose
