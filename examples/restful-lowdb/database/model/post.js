import db from '../db'
import Model from './_model'
import { __, assign, concat, difference, filter, find, has, last, size, remove, takeRight } from 'lodash/fp'

let _raw

export default class Post extends Model {
  static get raw () {
    return _raw || (_raw = db('posts', []))
  }

  static get currentId () {
    return Post.raw(size)
  }

  static find (_query) {
    const query = (typeof _query === 'number' ? { id: _query } : _query)

    if (typeof query.id === 'number') {
      return Post.raw(find(query))
    } else {
      return Post.raw(filter(query))
    }
  }

  static newest (amount = 1) {
    return Post.raw(
      takeRight(amount)
    )
  }

  static create (context) {
    Post.raw.write(
      concat(__, Object.assign(context, { id: 1 + Post.currentId }))
    )

    const result = Post.newest()[0]
    return result
  }

  static update (query, context) {
    const post = Post.find(query)

    if (post) {
      delete context.id // You can protect some fields yourself
      Object.assign(post, context)

      Post.save()
      return post
    }
  }

  static replace (query, context) {
    const post = Post.find(query)

    if (post) {
      delete context.id // You can protect some fields yourself

      const id = post.id
      Object.keys(post).forEach(key => delete post[key])
      Object.assign(post, context, { id })

      Post.save()
      return post
    }
  }

  static destroy (query) {
    let posts = Post.find(query)

    if (typeof posts === 'undefined') {
      posts = []
    } else if (!Array.isArray(posts)) {
      posts = [posts]
    }

    if (posts.length > 0) {
      const result = Post.raw(difference(__, posts))
      Post.save(result)
    }

    return posts.length
  }

  static save (state) {
    if (typeof state !== undefined) {
      Post.raw.write(() => state)
    } else {
      Post.raw.write([])
    }
  }
}
