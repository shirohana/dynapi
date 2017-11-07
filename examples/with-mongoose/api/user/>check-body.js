export default (req, res, next) => {
  const { username: name, password: pass } = req.body

  switch (req.path) {
    case '/user':
    case '/user/verify':
      return (isString(name, 4) && isString(pass, 4) ? next() : res.sendStatus(400))
    default:
      next()
  }
}

function isString (str, len = 0) {
  return typeof str === 'string' && str.length >= len
}
