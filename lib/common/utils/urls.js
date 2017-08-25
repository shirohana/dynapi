export function parseUrl (url) {
  return url
    .replace(/\/+/g, '/') // Remove trailing '//' -> '/'
    .replace(/^\/*/, '/') // At lease one '/' at the begin
    .replace(/\/+$/, '') // No '/' at the end
}

export function parsePattern (url) {
  const keys = parseUrl(url).slice(1).split('/')
  const pattern = keys.reduce((prev, curr) => `${prev}/${curr.startsWith(':') ? '([^/]+)' : curr}`, '')
  return new RegExp(`^${pattern}$`)
}

export function depthOf (url) {
  return parseUrl(url).slice(1).split('/').length
}
