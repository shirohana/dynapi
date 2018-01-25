export default (req, res, next) => {
  res.write(`${req.method} ${req.path}`)
  res.end()
}
