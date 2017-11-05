export default (req, res) => {
  res.json({ message: 'This message would not been sent(catched by >throw-plain-text.js)' })
}
