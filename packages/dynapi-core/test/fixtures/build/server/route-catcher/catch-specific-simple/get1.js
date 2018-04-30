import Err1 from '~error/err1'

export default (req, res) => {
  throw new Err1('Catch specific error')
}
