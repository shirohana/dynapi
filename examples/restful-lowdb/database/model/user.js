import db from '../db'
import Model from './_model'
import { takeRight } from 'lodash/fp'

let _raw

export default class User extends Model {
  static get raw () {
    return _raw || (_raw = db('users', []))
  }

  static newest (amount = 1) {
    return User.raw(
      takeRight(amount)
    )
  }
}
