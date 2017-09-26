import db from '../db'
import Model from './_model'
import { takeRight } from 'lodash/fp'

let _raw

export default class Album extends Model {
  static get raw () {
    return _raw || (_raw = db('albums', []))
  }

  static newest (amount = 1) {
    return Album.raw(
      takeRight(amount)
    )
  }
}
