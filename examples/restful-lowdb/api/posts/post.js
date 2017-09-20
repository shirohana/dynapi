import Post from '~model/post'

export default (req, res) => {
  const { title } = req.body

  // At lease have title
  if (typeof title !== 'string') {
    // TODO Wait for implementation of Catcher
    throw { status: 400 }
  }

  const result = Post.create(req.body)
  res.status(201).json(result)
}
