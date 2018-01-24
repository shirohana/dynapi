export default class UserNotFound extends Error {
  constructor (...args) {
    super(...args)
    this.name = this.constructor.name
    this.message = this.message || 'User not found'
    this.status = 404
  }
}
