import assert from 'assert'

export const ANCHOR_TYPE = {
  sequence: 'sequence'
}

export default class Anchor {
  constructor (options) {
    this._declaredAnchors = {}
  }

  plugin (name, fn) {
    const anchors = this._declaredAnchors[name]
    /* istanbul ignore else */
    if (anchors) {
      anchors.push(fn)
    }
  }

  declareAnchor (type, name, argList) {
    assert(type in ANCHOR_TYPE) // TODO Implement strict mode

    this._declaredAnchors[name] = Object.assign([], {
      type: type,
      args: argList // TODO Implement strict mode
    })
  }

  declareAnchors (type, pairs) {
    for (let pair of pairs) {
      const [name, args] = pair
      this.declareAnchor(type, name, args)
    }
  }

  hasPlugin (name) {
    return this._declaredAnchors[name].length > 0
  }

  anchor (name, ...args) {
    const anchors = this._declaredAnchors[name]

    assert(anchors)// TODO Implement strict mode

    if (anchors.length > 0) {
      switch (anchors.type) {
        case ANCHOR_TYPE.sequence:
          sequence(anchors, args)
          break
      }
    }
  }
}

function sequence (fns, args) {
  for (let fn of fns) {
    fn.apply(null, args)
  }
}
