import test from 'ava'
import { Utils } from '../../index.js'

test('parseKeys(filename)', t => {
  const parse = (file) => Utils.Routes.parseKeys(file).join('/')

  t.is('get', parse('get.js'))
  t.is('user/get', parse('user/get.js'))
  t.is('user/get', parse('getUser.js'))
  t.is('user/:user_id/get', parse('user/_user_id/get.js'))
  t.is('user/:userId/get', parse('getUser_userId.js'))
  t.is('page/:page-num/get', parse('page/_page-num/get.js'))
  t.is('', parse('_invalid.js'))
})


test('ensureRoutes()', t => {
  let root = Utils.Routes.createRoute({
    name: 'root',
    path: '/'
  })

  t.is(root, Utils.Routes.ensureRoutes(root, []))

  let parent = root
  let routeKeys = ['user', ':id', 'profile']

  Utils.Routes.ensureRoutes(root, routeKeys)
  routeKeys.forEach((key) => {
    const type = (key.startsWith(':') ? 'paramChildren' : 'children')
    parent = parent[type][key]
    t.is(typeof parent, 'object')
  })
})
