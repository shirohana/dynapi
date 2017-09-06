export default (req, res) => {
  if (res.json instanceof Function) {
    res.json({ message: 'It works!' })
  } else {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ message: 'It works!' }), 'utf8')
  }
}
