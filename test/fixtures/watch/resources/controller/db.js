// Simulate network delay
import queryDelay from './query-delay'

export default class Database {
  static async find (selector) {
    await new Promise(resolve => setTimeout(resolve, queryDelay))

    if (selector.id) {
      return staticDB[selector.id]
    } else if (selector.username) {
      const userId = Object.keys(staticDB).find(id => staticDB[id].username === selector.username)
      return staticDB[userId]
    } else {
      return undefined
    }
  }
}

const staticDB = {
  '1': {
    username: 'shirohana',
    nickname: 'Hana Shiro'
  }
}
