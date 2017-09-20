import db from '../db'
import Model from './_model'
import { filter, find, takeRight } from 'lodash/fp'

let _raw

export default class Comment extends Model {
  static get raw () {
    return _raw || (_raw = db('comments', []))
  }

  static find (_query) {
    const query = (typeof _query === 'number' ? { id: _query } : _query)

    if (typeof query.id === 'number') {
      return Comment.raw(find(query))
    } else {
      return Comment.raw(filter(query))
    }
  }

  static newest (amount = 1) {
    return Comment.raw(
      takeRight(amount)
    )
  }
}
