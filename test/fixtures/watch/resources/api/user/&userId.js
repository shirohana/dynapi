export const pattern = /^\d+$/

export default (req, res, next, userId) => {
  if (+userId < 10) {
    next()
  } else {
    next(new Error('UserId >= 10'))
  }
}
