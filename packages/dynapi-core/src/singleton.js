import factory from './factory'

let singleton = null

/* istanbul ignore next */
function dynapiSingleton (options = {}) {
  return singleton || (singleton = factory(options))
}

export default dynapiSingleton
