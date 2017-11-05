export default (req, res) => {
  res.json({ message: `GET /api/user/${req.userId || ''}` })
}
