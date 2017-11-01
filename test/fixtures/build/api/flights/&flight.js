export const pattern = /^[a-zA-Z]\d+$/

export default (req, res, next, flight) => {
  req.flight = flight
  next()
}
