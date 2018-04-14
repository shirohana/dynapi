import Err1 from '~error/err1'
import Err2 from '~error/err2'

export const catches = [Err1, Err2]

export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#c4')
  next()
}
