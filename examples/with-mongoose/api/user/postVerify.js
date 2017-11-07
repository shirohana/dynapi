import User from '~model/user'

export default async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })

    if (user === null) {
      return res.sendStatus(404)
    }

    if (await user.verify(password)) {
      res.json({ user })
    } else {
      res.sendStatus(403)
    }
  } catch (err) {
    console.error(err)

    res.sendStatus(500)
  }
}
