export default class BadRequest extends Error {
  constructor (...args) {
    super(...args)
    this.name = this.constructor.name
    this.message = this.message || 'Bad request'
    this.status = 400
  }
}
