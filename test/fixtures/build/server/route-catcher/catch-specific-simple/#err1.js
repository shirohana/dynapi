import assert from 'assert'
import Err1 from '~error/err1'

export const catches = Err1

export default (err, req, res, next) => {
  assert(err instanceof Err1)
  const errors = (req.errors = req.errors || [])
  errors.push('#err1')
  res.end(errors.join('->'))
}
