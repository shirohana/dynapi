export default (req, res, next) /* => */ {
  next() // Broken middleware will cause 500 when requests through by this
}
