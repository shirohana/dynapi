export default (req, res) => {
  res.send(req.user.toString())
}
