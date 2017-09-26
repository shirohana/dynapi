export default /* abstract */ class Model {
  constructor () {
    throw new TypeError('Shapeless model that provides static methods only')
  }

  static find (query) {
    throw new Error('Not implemented')
  }

  static newest (amount) {
    throw new Error('Not implemented')
  }

  static create (context) {
    throw new Error('Not implemented')
  }

  static update (query, context) {
    throw new Error('Not implemented')
  }

  static replace (query, context) {
    throw new Error('Not implemented')
  }

  static destroy (query) {
    throw new Error('Not implemented')
  }

  static save (state) {
    throw new Error('Not implemented')
  }
}
