export default class UserNotFoundError extends Error {
  constructor (message) {
    super(message)

    this.name = 'UserNotFound'
    this.status = 404
    this.code = 'USER_NOT_FOUND'
  }
}
