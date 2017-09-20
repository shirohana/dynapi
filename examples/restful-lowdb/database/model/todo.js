import db from '../db'
import Model from './_model'
import { takeRight } from 'lodash/fp'

let _raw

export default class Todo extends Model {
  static get raw () {
    return _raw || (_raw = db('todos', []))
  }

  static newest (amount = 1) {
    return Todo.raw(
      takeRight(amount)
    )
  }
}
