import User from '~model/user'

export default async (req, res) => {
  try {
    const result = await User.deleteOne({ username: req.params.username })
    res.json(result)
  } catch (err) {
    console.error(err.message)
    res.sendStatus(500)
  }
}
