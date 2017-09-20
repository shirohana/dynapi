import Post from '~model/post'

export default (req, res) => {
  res.json(Post.newest(100))
}
