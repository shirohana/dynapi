export default (err, req, res, next) => {
  req.errors = req.errors || []
  req.errors.push('#c1')
  next()
}
