export default class Err2 extends Error {
  constructor (message) {
    super(message)
    this.status = 403
  }
}
