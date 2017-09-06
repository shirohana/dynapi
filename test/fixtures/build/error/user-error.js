// For relative requires
export default class UserError extends Error {
  constructor (message) {
    super(message)

    this.status = 404
  }
}
