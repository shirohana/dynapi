import factory from './factory'

let singleton = null

export default function dynapiSingleton (options = {}) {
  return singleton || (singleton = factory(options))
}
