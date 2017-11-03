const kebabPattern = /[a-z]+|[0-9]+|[A-Z][a-z]+|[A-Z]+(?![a-z]+)/g

export function kebabCase (str) {
  return str.match(kebabPattern).reduce((str, word) => (str += `-${word.toLowerCase()}`), '').slice(1)
}
