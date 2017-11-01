// ParamRoute will lookup parameter files with the same name in parents
import User from '~model/user'
import UserNotFoundError from '~error/user-not-found'

export const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/

// username === req.params['username'] === /api/user/(:username)
export default async (req, res, next, username) => {
  // Fetch user
  let user = await User.find({ username })

  if (req.method === 'GET') {
    await new Promise(resolve => setTimeout(resolve, 400))
  }

  // User exist or throw an Error
  if (user) {
    req.user = user
    return next()
  } else {
    return next(new UserNotFoundError(`Can't find user which username: ${username}`))
  }
}

// Too short for GET /api/user/:username
export const timeout = 300
