import test from 'ava'
import { Utils } from '../../index.js'

test('isFilenameSimple(filename)', t => {
  const isSimple = Utils.isFilenameSimple

  t.true(isSimple('get.js'))
  t.true(isSimple('get'))
  t.false(isSimple('getUser.js'))
  t.false(isSimple('g0t.js'))
})

test('isFilenameValid(filename)', t => {
  const isValid = Utils.isFilenameValid

  t.true(isValid('get.js'))
  t.true(isValid('get'))
  t.true(isValid('getUser.js'))
  t.true(isValid('getUserProfile.js'))
  t.true(isValid('getUser_name-Profile.js'))
  t.true(isValid('abC-D_E.js'))
  t.true(isValid('methodPath1-Path2_Param1.js'))
  t.true(isValid('method-Path1-Path2_Param1.js'))
  t.false(isValid('GetUser.js'))
})

test('parseKeys(filename)', t => {
  const parse = (file) => Utils.parseKeys(file).join('/')

  t.is('get', parse('get.js'))
  t.is('user/get', parse('user/get.js'))
  t.is('user/get', parse('getUser.js'))
  t.is('user/:user_id/get', parse('user/_user-id/get.js'))
  t.is('user/:user_id/get', parse('getUser_userId.js'))
  t.is('page/:page_num/get', parse('page/_page-num/get.js'))
  t.is('', parse('_invalid.js'))
})


test('ensureRoutes()', t => {
  let root = Utils.createRoute({
    name: 'root',
    path: '/'
  })

  t.is(root, Utils.ensureRoutes(root, []))

  let parent = root
  let routeKeys = ['user', ':id', 'profile']

  Utils.ensureRoutes(root, routeKeys)
  routeKeys.forEach((key) => {
    t.is(typeof parent.children[0], 'object')
    parent = parent.children[0]
  })
})
