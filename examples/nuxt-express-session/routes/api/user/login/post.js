export default (req, res) => {
  // Lazy login
  req.session.user = {
    username: req.body.username
  }

  res.json(req.session.user)
}
