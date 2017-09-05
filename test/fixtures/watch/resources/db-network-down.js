// It would cause response timeout
export const queryDelay = 1200

export default class Database {
  static async find (selector) {
    await new Promise(resolve => setTimeout(resolve, queryDelay))

    if (selector.id) {
      return staticDB[selector.id]
    } else if (selector.username) {
      const user = Object.values(staticDB).find(row => row.username === selector.username)
      return user
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
