import Todo from '~model/todo'

export default (req, res) => {
  const result = Todo.newest(200)
  res.json(result)
}
