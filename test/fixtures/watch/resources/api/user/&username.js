// '~model' should be solved as a alias to 'srcDir/controller/model'
import User from '~model/user'
// '~/' should be solved to srcDir
import UserNotFoundError from '~/error/user-not-found'

export const pattern = /^[a-zA-Z][a-zA-Z0-9_-]{3,}$/
export const timeout = 600

export default async (req, res, next, username) => {
  const user = await User.find({ username })

  if (user !== undefined) {
    req.user = user
    next()
  } else {
    next(new UserNotFoundError('Username not found'))
  }
}
