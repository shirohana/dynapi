import User from '~model/user'

export default (req, res) => {
  const result = User.newest(10)
  res.json(result)
}
