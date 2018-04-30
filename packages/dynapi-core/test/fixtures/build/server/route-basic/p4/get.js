export default (req, res) => {
  res.statusCode = 406
  throw new Error()
}
