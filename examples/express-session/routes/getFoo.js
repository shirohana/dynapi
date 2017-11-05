export default (req, res) => {
  // Strict
  if (req.path !== '/foo') {
    return
  }

  res.render('view-count', {
    path: req.path,
    count: req.session.views[req.path]
  })
}
