import Post from '~model/post'

export default (req, res) => {
  const result = Post.replace(req.id, req.body) || Post.create(req.body)
  res.json(result)
}
