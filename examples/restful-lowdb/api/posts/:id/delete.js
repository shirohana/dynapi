import Post from '~model/post'

export default (req, res) => {
  const result = Post.destroy(req.id)
  res.json(result)
}
