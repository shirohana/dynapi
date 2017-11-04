export const pattern = /^\d+$/

export default (req, res, next, userId) => {
  if (+userId < 10) {
    next()
  } else {
    const error = new Error('UserId >= 10')
    error.status = 404
    next(error)
  }
}
