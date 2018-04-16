import test from 'ava'
import { join } from 'path'
import request from 'supertest'
import _require from 'native-require'

const fixtures = _require.from(join(__dirname, './fixtures/compatibility'))

test('Should works with `Node.HTTP`', async t => {
  const server = request(await fixtures.require('./server-node-http')())
  const res = await server.post('/')
  t.is(res.status, 200)
  t.is(res.headers['content-type'], 'application/json; charset=utf-8')
  t.deepEqual(res.body, { message: 'It works!' })
})

test('Should works with `Connect`', async t => {
  const server = request(await fixtures.require('./server-connect')())
  const res = await server.post('/')
  t.is(res.status, 200)
  t.is(res.headers['content-type'], 'application/json; charset=utf-8')
  t.deepEqual(res.body, { message: 'It works!' })
})
