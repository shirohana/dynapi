import User from '~/models/user'

export default (req, res) => {
  const user = new User(req.params['name'])
  res.send(user.greet())
}
