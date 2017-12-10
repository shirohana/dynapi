import User from '~model/user'

export default async (req, res) => {
  try {
    const users = await User.find()
    res.json({ users })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}
