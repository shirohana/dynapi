import Err1 from '~error/err1'
import Err2 from '~error/err2'

export default (err, req, res, next) => {
  const errors = (req.errors = req.errors || [])
  errors.push('#c7')

  if (err instanceof Err1) {
    res.end(errors.join('->')) // #c1->#c2->#c4->#c6->#c7
  } else if (err instanceof Err2) {
    throw err // #c4->#c5->#c7
  }
}
