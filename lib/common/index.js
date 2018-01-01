import Utils from './utils'
import Options from './options'

export {
  Utils,
  Options
}

/**
 * Ponyfill of Object.values
 */
export const objectValues = Object.values || /* istanbul ignore next */ function objectValues (obj) {
  return Object.keys(obj).map(k => obj[k])
}

/**
 * Ponyfill of Object.entries
 */
export const objectEntries = Object.entries || /* istanbul ignore next */ function objectEntries (obj) {
  return Object.keys(obj).map(k => [k, obj[k]])
}
