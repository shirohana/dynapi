export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#401')
  res.end(errors.join('->'))
}
