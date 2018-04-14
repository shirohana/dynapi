// This Catcher should not be invoked

export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#c3')
  next()
}
