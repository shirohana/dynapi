export default (req, res) => {
  const p1 = req.params['p1']
  res.send(`Hello, ${p1}. GET /p1/${p1}`)
}
