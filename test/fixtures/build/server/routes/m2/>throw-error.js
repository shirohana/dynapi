export default (req, res, next) => {
  switch (req.method) {
    case 'GET':
      return next()
    case 'POST':
      throw Object.assign(new Error('GET will throw 500'))
    case 'PUT':
      throw Object.assign(new Error('PUT will throw 400'), { status: 400 })
    case 'PATCH':
      throw 401
  }
}
