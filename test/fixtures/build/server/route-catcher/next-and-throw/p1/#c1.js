export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#c1')

  // Replace err to text
  next('through-c1')
}
