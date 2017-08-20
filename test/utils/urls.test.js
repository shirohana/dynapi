import test from 'ava'
import { Utils } from '../../index.js'

test('parseUrl(url)', t => {
  const parse = Utils.parseUrl

  t.is(parse('user'), '/user')
  t.is(parse('user/shirohana/'), '/user/shirohana')
  t.is(parse('//user//shirohana//'), '/user/shirohana')
})

test('parsePattern(url)', t => {
  const parse = Utils.parsePattern

  let pattern = parse('user/:id')
  t.regex('/user/1', pattern)
  t.notRegex('user/2', pattern)
  t.notRegex('user/3/', pattern)
  t.notRegex('/user/4/', pattern)

  pattern = parse('/:page/:numder')
  t.regex('/news/3', pattern)
  t.regex('/system/errors', pattern)
  t.notRegex('/user/shirohana/profile', pattern)
})

test('depthOf(url)', t => {
  const depth = Utils.depthOf

  t.is(depth('/user'), 1)
  t.is(depth('/user/0/'), 2)
  t.is(depth('user/0/profile'), 3)
})
