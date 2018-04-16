import Err2 from '~error/err2'

export const catches = [Err2]

export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#c5')
  next()
}
