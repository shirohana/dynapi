export default (req, res, next) => {
  if (req.path !== '/specials/throwing-plain-text') {
    next()
  }

  next('Throw plain text in middleware for coverage')
}
