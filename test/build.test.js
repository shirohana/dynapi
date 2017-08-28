import test from 'ava'
import { join } from 'path'
import request from 'supertest'
import nrequire from 'native-require'

process.env.DEBUG = 'api:*'

const _require = nrequire.from(join(__dirname, './fixtures/build'))

let port = 3110
let server = null

test.before(async () => {
  process.env.dynapi_test_port = port++
  server = await _require('./server-express')()
})

test('FETCH /api/user/2  <-- Not defined method', t => {
  t.notThrows(async () => {
    await request(server)
      .put('/api/user/2')
      .expect(404)
  })
})

test('GET /api/user/1  <-- Exists admin user', async t => {
  await request(server)
    .get('/api/user/1')
    .expect(200)
    .type('json')
    .expect(({ body: user }) => {
      t.is(user.name, 'Hana Shiro')
      t.is(user.username, 'shirohana')
      t.is(user.email, 'shirohana0608@gmail.com')
      t.is(user.password, undefined)
    })
})

test('GET /api/user/3  <-- Non exists user', t => {
  t.notThrows(async () => {
    await request(server)
      .get('/api/user/3')
      .expect(404)
      .expect('Content-Type', 'text/plain; charset=utf-8')
  })
})

test('POST /api/user/1  <-- Request with no permission', t => {
  t.notThrows(async () => {
    await request(server)
      .post('/api/user/1')
      .expect(403)
      .expect('Content-Type', 'text/plain; charset=utf-8')
  })
})

test('POST /api/user/2  <-- Request with permission no-needed', async t => {
  await request(server)
    .post('/api/user/2')
    .expect(200)
    .type('json')
    .expect(({ body }) => {
      t.true(body.success)
    })
})

test('GET /api/user/shirohana  <-- It took too many time', t => {
  t.notThrows(async () => {
    await request(server)
      .get('/api/user/shirohana')
      .expect(408)
  })
})

test('POST /api/user/shirohana  <-- timeout === 0 will reject', t => {
  t.notThrows(async () => {
    await request(server)
      .post('/api/user/shirohana')
      .expect(408)
  })
})

test('GET /api/async-method  <-- Async method', async t => {
  await request(server)
    .get('/api/async-method')
    .expect(200)
    .type('json')
    .expect(({ body }) => {
      t.is(body.message, 'async-method resolved!')
    })
})

test.after(async () => {
  await server.close()
})
