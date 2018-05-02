const KEBAB_CASE_REGEXP = /[a-z]+|[0-9]+|[A-Z][a-z]+|[A-Z]+(?![a-z]+)/g
const toLowerCase = Function.prototype.call.bind(String.prototype.toLowerCase)

export function kebabCase (str) {
  return str.match(KEBAB_CASE_REGEXP).map(toLowerCase).join('-')
}
