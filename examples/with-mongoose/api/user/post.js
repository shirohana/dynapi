import User from '~model/user'

export default async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.create({ username, password })
    res.json({ user })
  } catch (err) {
    console.error(err.message)

    if (err.code === 11000) {
      res.sendStatus(406)
    } else {
      res.sendStatus(500)
    }
  }
}
