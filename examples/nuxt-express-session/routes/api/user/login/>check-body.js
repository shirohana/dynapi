const isString = (str) => (typeof str === 'string')

export default (req, res, next) => {
  const { body } = req

  if (isString(body.username) && body.username.length >= 4) {
    return next()
  } else {
    return next({ silent: true, status: 400 })
  }
}
