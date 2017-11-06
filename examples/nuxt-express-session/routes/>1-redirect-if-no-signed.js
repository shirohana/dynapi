const allows = {
  'unsigned': [
    'GET /auth',
    'POST /api/user/login'
  ]
}

export default (req, res, next) => {
  if (req.isSigned) {
    return next()
  }

  if (allows['unsigned'].includes(req.request)) {
    return next()
  } else {
    res.redirect('/auth')
  }
}
