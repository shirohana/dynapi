import assert from 'assert'
import Err1 from '~error/err1'

// Re-throw an error(Err1)

export default (err, req, res, next) => {
  assert(err, 'through-c1')
  const errors = (req.errors = req.errors || [])
  errors.push('#c2')
  throw new Err1(err)
}
