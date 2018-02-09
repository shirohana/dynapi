export default class UserNotFound extends Error {
  constructor (msg) {
    super(msg)
    this.name = this.constructor.name
    this.status = 404
  }
}
