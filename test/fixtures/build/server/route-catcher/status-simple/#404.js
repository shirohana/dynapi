export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#404')
  res.end(errors.join('->'))
}
