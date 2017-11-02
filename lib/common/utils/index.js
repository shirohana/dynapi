import * as Messages from './messages'
import * as Routes from './routes'
import * as Times from './times'

export { Messages, Routes, Times }

// Object.values ponyfill
export const objectValues = Object.values || function objectValues (obj) {
  return Object.keys(obj).map(k => obj[k])
}

// Object.entries ponyfill
export const objectEntries = Object.entries || function objectEntries (obj) {
  return Object.keys(obj).map(k => [k, obj[k]])
}
