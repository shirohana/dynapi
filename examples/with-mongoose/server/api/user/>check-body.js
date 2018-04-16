import BadRequest from '~error/bad-request'

export default (req, res, next) => {
  const { username: name, password: pass } = req.body

  switch (req.path) {
    case '/user':
      if (!name || name.length < 4) {
        throw new BadRequest('req.body.username.length < 4')
      }
      if (!pass || pass.length < 4) {
        throw new BadRequest('req.body.password.length < 4')
      }
      break

    case '/user/verify':
      if (!name) {
        throw new BadRequest('req.body.username was required')
      }
      if (!pass) {
        throw new BadRequest('req.body.password was required')
      }
  }

  next()
}
