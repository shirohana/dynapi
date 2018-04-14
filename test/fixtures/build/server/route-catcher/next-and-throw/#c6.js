import Err1 from '~error/err1'

export const catches = [Err1]

export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#c6')
  next()
}
