export default (req, res) => {
  const { country, flight } = req
  res.json({ country, flight })
}
