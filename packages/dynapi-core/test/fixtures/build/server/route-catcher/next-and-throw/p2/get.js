import Err2 from '~error/err2'

export default (req, res) => {
  throw new Err2('Will pass through parent route')
}
