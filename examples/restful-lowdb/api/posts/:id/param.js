export const pattern = /^\d+$/

export default (req, res, next, id) => {
  req.id = +id
  next()
}
