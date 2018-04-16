export default class WrongPassword extends Error {
  constructor (...args) {
    super(...args)
    this.name = this.constructor.name
    this.message = this.message || 'Wrong password'
    this.status = 403
  }
}
