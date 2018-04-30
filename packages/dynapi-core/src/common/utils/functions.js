export function isInstance (obj, proto) {
  if (typeof proto === 'function') {
    return obj instanceof proto
  } else {
    return false
  }
}
