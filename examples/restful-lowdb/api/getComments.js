import Comment from '~model/comment'

export default (req, res) => {
  const result = Comment.newest(500)
  res.json(result)
}
