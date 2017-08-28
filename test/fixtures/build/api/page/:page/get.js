// ParamRoute without `param.js`
export default (req, res) => {
  res.json({ page: req.params['page'] })
}
