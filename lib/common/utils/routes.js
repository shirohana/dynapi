const escapeParamColonPattern = /\\\\|[\\:]:/g
const paramPattern = /:[a-zA-Z0-9_]/

export function hasParam (path) {
  const escapedPaths = path.replace(escapeParamColonPattern, p => p[1] === ':' ? '\n' : '\\').split('\n')
  return escapedPaths.some(p => paramPattern.test(p))
}

export function flattenParamPattern (pattern) {
  if (pattern instanceof RegExp) {
    return pattern.toString()
      .replace(/^\/\^?/, '')
      .replace(/\$?\/$/, '')
      .replace(/\((?!\?[:=!])/g, '(?:')
  } else {
    return ''
  }
}
