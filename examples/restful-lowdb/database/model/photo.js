import db from '../db'
import Model from './_model'
import { takeRight } from 'lodash/fp'

let _raw

export default class Photo extends Model {
  static get raw () {
    return _raw || (_raw = db('photos', []))
  }

  static newest (amount = 1) {
    return Photo.raw(
      takeRight(amount)
    )
  }
}
