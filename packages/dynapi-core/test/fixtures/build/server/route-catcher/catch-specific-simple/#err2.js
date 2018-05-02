import assert from 'assert'
import Err2 from '~error/err2'

export const catches = Err2

export default (err, req, res, next) => {
  assert(err instanceof Err2)
  const errors = (req.errors = req.errors || [])
  errors.push('#err2')
  res.end(errors.join('->'))
}
