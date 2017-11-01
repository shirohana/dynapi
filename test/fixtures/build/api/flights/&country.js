export const pattern = /[a-zA-Z]+/

export default (req, res, next, country) => {
  req.country = country.toUpperCase()
  next()
}
