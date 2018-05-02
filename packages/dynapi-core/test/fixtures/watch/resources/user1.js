import hello from './hello'

export default class User {
  constructor (name) {
    this.name = name
  }

  greet () {
    return `${hello}, ${this.name}`
  }
}
