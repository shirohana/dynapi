import assert from 'assert'
import Anchor from '../core/anchor'

const dev = process.env.NODE_ENV !== 'production'

export default class Builder extends Anchor {
  constructor () {
    super()

    /* istanbul ignore if */
    if (new.target === Builder) {
      throw new TypeError('Try to create instance of abstracr class')
    }

    /* istanbul ignore else */
    if (dev) {
      // fetch (filename)
      assert.equal(typeof this.fetch, 'function')
      assert(this.fetch.length >= 1)

      // transform (filename)
      assert.equal(typeof this.transform, 'function')
      assert(this.transform.length >= 1)

      // [async] build ()
      assert.equal(typeof this.build, 'function')

      // require (request, from)
      assert.equal(typeof this.require, 'function')
      assert(this.require.length >= 2)
    }
  }

  static getBuildFailureHandle (err) {
    return function dynapiTransformFailure (req, res, next) {
      err.status = err.status || 500

      if (typeof next === 'function') {
        return next(err)
      } else {
        throw err
      }
    }
  }
}
