import * as Messages from './messages'
import * as Routes from './routes'
import * as Strings from './strings'
import * as Times from './times'

export { Messages, Routes, Strings, Times }

// Object.values ponyfill
export const objectValues = Object.values || /* istanbul ignore next */ function objectValues (obj) {
  return Object.keys(obj).map(k => obj[k])
}

// Object.entries ponyfill
export const objectEntries = Object.entries || /* istanbul ignore next */ function objectEntries (obj) {
  return Object.keys(obj).map(k => [k, obj[k]])
}
