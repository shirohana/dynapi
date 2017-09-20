import Comment from '~model/comment'

export default (req, res) => {
  const result = Comment.find({ postId: req.id })
  res.json(result)
}
