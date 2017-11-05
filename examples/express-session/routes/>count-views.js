export default (req, res, next) => {
  if (!req.session.views) {
    req.session.views = {}
  }

  req.session.views[req.path] = (req.session.views[req.path] || 0) + 1
  next()
}
