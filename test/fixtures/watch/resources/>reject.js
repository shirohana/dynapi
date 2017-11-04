export default (req, res, next) => {
  const error = new Error('Rejected')
  error.status = 403
  next(error)
}
