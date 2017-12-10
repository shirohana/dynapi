import bcrypt from 'bcrypt'
import { Schema } from 'mongoose'
import db from '../db'

const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: { type: String }
})

UserSchema.pre('save', async function (next) {
  const user = this

 if (!user.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(user.password, salt)

    user.password = hashed
    next()
  } catch (err) {
    next(err)
  }
})

UserSchema.methods.verify = async function (pass) {
  return await bcrypt.compare(pass, this.password)
}

UserSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password
    return ret
  }
})

const User = db.model('User', UserSchema)

export default User
