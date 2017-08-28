export function pick (_obj, ...keys) {
  return keys.reduce((obj, key) => {
    obj[key] = _obj[key]
    return obj
  }, {})
}
