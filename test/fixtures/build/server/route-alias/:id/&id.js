import User from '~models/user'
import UserNotFound from '~/errors/user-not-found'

export default (req, res, next, id) => {
  if (id < 10) {
    req.user = User.find(id)
    return next()
  } else {
    throw new UserNotFound(`Can't find user: ${id}`)
  }
}
