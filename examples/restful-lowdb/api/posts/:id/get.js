import Post from '~model/post'

export default (req, res) => {
  const result = Post.find(req.id)

  if (typeof result === 'undefined') {
    throw { status: 404 } // TODO Implement Catcher
  }

  res.json(result)
}
