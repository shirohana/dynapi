export default class Err1 extends Error {
  constructor (message) {
    super(message)
    this.status = 401
  }
}
