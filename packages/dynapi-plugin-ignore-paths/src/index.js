const ESCAPE_STRING_REGEXP = /[\\^$*+?.|()[\\]{}]/g

function dynapiPluginIgnorePaths (ignorePaths) {
  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    const assert = require('assert')
    assert(Array.isArray(ignorePaths))
  }

  const paths = ignorePaths.reduce((arr, path) => {
    /* istanbul ignore else */
    if (typeof path === 'string') {
      arr.push(strToRegex(path))
    } else if (path instanceof RegExp) {
      arr.push(path)
    }
    return arr
  }, [])

  function plugin (router) {
    /* istanbul ignore if */
    if (paths.length < 1) {
      return
    }

    router.plugin('beforeRequest', (status, req, res, { skip }) => {
      /* istanbul ignore if */
      if (status.isSkipped) {
        return
      }

      for (let path of paths) {
        if (path.test(req.path)) {
          skip()
          return
        }
      }
    })
  }

  return plugin
}

exports = module.exports = dynapiPluginIgnorePaths

exports.availables = {
  Router: true
}

function strToRegex (str) {
  const raw = '^' +
    (str[0] === '/' ? '' : '(?:[^/]*/)+') +
    str.replace(ESCAPE_STRING_REGEXP, '\\$&') +
    (str[str.length - 1] === '/' ? '' : '$')
  return new RegExp(raw)
}
