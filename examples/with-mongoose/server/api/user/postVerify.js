import User from '~model/user'
import UserNotFound from '~error/user-not-found'
import WrongPassword from '~error/wrong-password'

export default async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })

  if (user === null) {
    throw new UserNotFound(`Can't find user ${username}`)
  }

  if (!(await user.verify(password))) {
    throw new WrongPassword()
  }

  res.json({ user })
}
