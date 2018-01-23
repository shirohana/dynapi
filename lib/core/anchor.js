import assert from 'assert'

export const ANCHOR_TYPE = {
  sequence: 'sequence',
  waterfall: 'waterfall'
}

export default class Anchor {
  constructor (options) {
    this._declaredAnchors = {}
  }

  plugin (name, fn) {
    const anchors = this._declaredAnchors[name]
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

  static get ANCHOR_TYPE () {
    return ANCHOR_TYPE
  }

  anchor (name, ...args) {
    const anchors = this._declaredAnchors[name]

    assert(anchors)// TODO Implement strict mode

    if (anchors.length > 0) {
      switch (anchors.type) {
        case ANCHOR_TYPE.sequence:
          return sequence(anchors, args)
        case ANCHOR_TYPE.waterfall:
          const [initState, ...leftArgs] = args
          return waterfall(anchors, initState, leftArgs)
        // TODO case ANCHOR_TYPE.PARALLEL:
      }
    }
  }
}

function sequence (fns, args) {
  for (let fn of fns) {
    fn.apply(null, args)
  }
}

function waterfall (fns, init, args) {
  return fns.reduce((falling, fn) => fn([falling, args]), init)
}
