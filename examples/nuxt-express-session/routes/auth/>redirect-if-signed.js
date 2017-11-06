export default (req, res, next) => {
  if (req.isSigned && req.method === 'GET') {
    return res.redirect('/')
  }

  next()
}
