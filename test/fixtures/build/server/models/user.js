export default class User {
  constructor (id) {
    this.id = id
  }

  toString () {
    return `User::${this.id}`
  }

  static find (id) {
    return new User(id)
  }
}
