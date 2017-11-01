import _debug from 'debug'
import { pick } from '~utils'

const debug = _debug('test:build')

// Simulate database
export default class User {
  constructor () {}

  static async find (selector) {
    if (typeof selector === 'string') {
      selector = { id: selector } // Treat as id
    }

    debug('User.find(%s)  // for coverage', selector)

    if (typeof selector !== 'object') {
      throw new TypeError('Selector must be a string or object')
    }

    let user = undefined
    if (selector.id) {
      await delay(200) // Simulate query time
      user = staticUsers[selector.id]
    } else if (selector.username) {
      await delay(400) // Simulate longer query time
      user = Object.
      user = staticUsersFromUsername[selector.username]
    }

    return user === undefined ? null : pick(user, 'name', 'username', 'email', 'isAdmin')
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const staticUsers = {
  '1': {
    name: 'Hana Shiro',
    username: 'shirohana',
    password: '********',
    email: 'shirohana0608@gmail.com',
    isAdmin: true
  },
  '2': {
    name: 'Tester',
    username: 'test',
    password: 'test-test',
    email: 'test@shirohana.me'
  }
}

const staticUsersFromUsername = Object.keys(staticUsers).reduce((obj, id) => {
  obj[staticUsers[id].username] = staticUsers[id]
  return obj
}, {})
