export function digits2 (source) {
  return ('00' + source).slice(-2)
}

export function currentTime () {
  const now = new Date()
  return `${digits2(now.getHours())}:${digits2(now.getMinutes())}:${digits2(now.getSeconds())}`
}
