// Relative import
import db from '../db'

export default class User {
  static async find (selector) {
    return db.find(selector)
  }
}
