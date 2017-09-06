export default class UserNotFoundError extends Error {
  constructor (message) {
    super(message)

    // TODO Implement custom error to allow send readable errors in 20x
    this.status = 400
  }
}
