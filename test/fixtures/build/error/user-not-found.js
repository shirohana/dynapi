import UserError from './user-error'

export default class UserNotFoundError extends UserError {
  constructor (message) {
    super(message)

    this.name = 'UserNotFound'
    this.code = 'USER_NOT_FOUND'
  }
}
