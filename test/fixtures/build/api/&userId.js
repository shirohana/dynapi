// ParamRoute will lookup parameter files with the same name in parents
import User from '~model/user'
import UserNotFoundError from '~error/user-not-found'

export const pattern = /^\d+$/

// userId === req.params['userId'] === /api/user/(:userId)
export default async (req, res, next, userId) => {
  // Fetch user
  let user = await User.find({
    id: userId
  })

  // User exist or throw an Error
  if (user) {
    req.user = user
    return next()
  } else {
    return next(new UserNotFoundError(`Can't find user which id: ${userId}`))
  }
}
