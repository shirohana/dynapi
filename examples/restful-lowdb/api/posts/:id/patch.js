import Post from '~model/post'

export default (req, res) => {
  // You should only pass allowed fields
  const result = Post.update(req.id, req.body)

  if (!result) {
    throw { status: 404 } // TODO Implement Catcher
  }

  res.json(result)
}
