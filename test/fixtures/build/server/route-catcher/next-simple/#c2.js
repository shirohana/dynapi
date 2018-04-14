export default (err, req, res, next) => {
  req.errors = req.errors || []
  req.errors.push('#c2')
  res.end(req.errors.join('->'))
}
