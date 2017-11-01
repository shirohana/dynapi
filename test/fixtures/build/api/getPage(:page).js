export default (req, res) => {
  // req.params will filled with matched arguments
  res.json({ page: req.params['page'] })
}
