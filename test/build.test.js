import test from 'ava'
import { join } from 'path'
import request from 'supertest'
import nrequire from 'native-require'

process.on('unhandledRejection', err => {
  throw err
})

const _require = nrequire.from(join(__dirname, './fixtures/build'))

let server = null

test.before(async () => {
  server = request(await _require('./server-express')())
})

test('GET /api/page/news  <-- Complex filename with parentheses', async t => {
  const res = await server.get('/api/page/news')
  t.is(res.status, 200)
  t.deepEqual(res.body, { page: 'news' })
})

test('POST /api/flights/taiwan-A68 <-- Complex ParamRoute', async t => {
  const res = await server.post('/api/flights/taiwan-A68')
  t.is(res.status, 200)
  t.deepEqual(res.body, { country: 'TAIWAN', flight: 'A68' })
})

test('GET /api/user/1  <-- Exists user', async t => {
  const res = await server.get('/api/user/1')
  t.is(res.status, 200)
  t.deepEqual(res.body, {
    name: 'Hana Shiro',
    isAdmin: true,
    username: 'shirohana',
    email: 'shirohana0608@gmail.com'
  })
})

test('GET /api/user/3  <-- Non-exists user', async t => {
  const res = await server.get('/api/user/3')
  t.is(res.status, 404)
})

test('POST /api/user/1  <-- Request with token', async t => {
  const res = await server.post('/api/user/1').send({ token: 'TOKEN' })
  t.is(res.status, 200)
  t.deepEqual(res.body, { success: true })
})

test('POST /api/user/1  <-- Request without token', async t => {
  const res = await server.post('/api/user/1')
  t.is(res.status, 403)
})

test('GET /api/user/shirohana  <-- Timeout was too short', async t => {
  const res = await server.get('/api/user/shirohana')
  t.is(res.status, 408)
})

test('POST /api/user/shirohana  <-- Timeout === 0 will be rejected by 408', async t => {
  const res = await server.post('/api/user/shirohana')
  t.is(res.status, 408)
})

test('GET /api/specials/timeout-zero <-- Timeout === 0 ', async t => {
  const res = await server.get('/api/specials/timeout-zero')
  t.is(res.status, 408)
})

test('GET /api/specials/exports-not-function <-- Default export is not a function', async t => {
  const res = await server.get('/api/specials/exports-not-function')
  t.is(res.status, 500)
})

test('GET /api/specials/syntax-error <-- Build failed path would got 500', async t => {
  const res = await server.get('/api/specials/syntax-error')
  t.is(res.status, 500)
})

test('GET /api/specials/throwing-plain-text <-- Coverage', async t => {
  const res = await server.get('/api/specials/throwing-plain-text')
  t.is(res.status, 500)
})

test('GET /api/specials/throwing-plain-error <-- Coverage', async t => {
  const res = await server.get('/api/specials/throwing-plain-error')
  t.is(res.status, 500)
})

test('GET /api/specials/script::new <-- Converage', async t => {
  const res = await server.get('/api/specials/script::new')
  t.is(res.status, 200)
  t.deepEqual(res.body, {
    message: 'new Script()'
  })
})

test('GET /api/specials/c:\\\\program files <-- Converage', async t => {
  const res = await server.get(encodeURI('/api/specials/c:\\\\program files'))
  t.is(res.status, 200)
  t.deepEqual(res.body, {
    message: 'You are sooo MS'
  })
})

test('GET /api/loose-path <-- Should passed through dynapi', async t => {
  const res = await server.get('/api/loose-path')
  t.is(res.status, 200)
  t.deepEqual(res.body, {
    message: 'passed through dynapi'
  })
})
