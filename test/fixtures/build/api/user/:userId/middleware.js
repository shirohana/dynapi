import PermissionDenyError from '~error/permission-deny'

export default (req, res, next) => {
  // req.user is ready here

  // Pass through
  if (req.method === 'GET') {
    return next()
  }

  // Validation user identity
  if (req.user.isAdmin) {
    // TODO If user is signed (logged in) and is admin, or rejected
    return next(new PermissionDenyError('Access an admin is not allowed'))
  } else {
    return next()
  }
}
