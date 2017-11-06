export default (req, res, next) => {
  req.request = `${req.method} ${req.path}`
  req.isSigned = (req.session.user !== undefined)

  next()
}
