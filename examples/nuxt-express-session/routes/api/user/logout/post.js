export default (req, res) => {
  delete req.session.user
  res.sendStatus(204)
}
