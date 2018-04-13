export default (err, req, res, next) => {
  const { errs } = req
  const message = (Array.isArray(errs) ? errs.join('->') : (err && err.message))

  res.end('#all:' + message)
}
