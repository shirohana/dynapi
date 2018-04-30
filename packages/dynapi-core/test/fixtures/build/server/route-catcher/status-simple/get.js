export default (req, res) => {
  const error = new Error('Basic error with status')
  error.status = 403
  throw error
}
