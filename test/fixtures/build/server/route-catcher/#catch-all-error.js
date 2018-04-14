export default (err, req, res, next) => {
  const { errors } = req
  const message = (Array.isArray(errors) ? errors.join('->') : (err && err.message))

  res.end('#all:' + message)
}
