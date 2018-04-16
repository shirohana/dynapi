export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#403')
  res.end(errors.join('->'))
}
