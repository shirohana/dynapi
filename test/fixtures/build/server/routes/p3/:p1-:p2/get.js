export default (req, res) => {
  const { p1, p2 } = req.params
  res.send(`Reversed: ${p2}-${p1}`)
}
