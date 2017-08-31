import test from 'ava'
import { join } from 'path'
import request from 'supertest'
import nrequire from 'native-require'

const _require = nrequire.from(join(__dirname, './fixtures/build'))

let port = 3100

test.beforeEach(() => {
  process.env.dynapi_test_port = port++
})

test.serial('With Node.HTTP', async t => {
  t.plan(1)
  const server = await _require('./server-node-http')()

  await request(server)
    .get('/basic')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(({ body }) => {
      t.is(body.message, 'It works!')
    })

  server.close()
})

test.serial('With Connect', async t => {
  t.plan(1)
  const server = await _require('./server-connect')()

  await request(server)
    .get('/api/basic')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(({ body }) => {
      t.is(body.message, 'It works!')
    })

  server.close()
})

test.serial('With Express.js', async t => {
  t.plan(1)
  const server = await _require('./server-express')()

  await request(server)
    .get('/api/basic')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(({ body }) => {
      t.is(body.message, 'It works!')
    })

  server.close()
})
