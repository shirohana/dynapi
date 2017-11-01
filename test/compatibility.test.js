import test from 'ava'
import { join } from 'path'
import request from 'supertest'
import nrequire from 'native-require'

const _require = nrequire.from(join(__dirname, './fixtures/compatibility'))

test.serial('With Node.HTTP', async t => {
  const server = await _require('./server-node-http')()

  const res = await request(server).get('/basic')
  t.is(res.status, 200)
  t.is(res.headers['content-type'], 'application/json; charset=utf-8')
  t.deepEqual(res.body, {
    message: 'It works!'
  })
})

test.serial('With Connect', async t => {
  const server = await _require('./server-connect')()

  const res = await request(server).get('/api/basic')
  t.is(res.status, 200)
  t.is(res.headers['content-type'], 'application/json; charset=utf-8')
  t.deepEqual(res.body, {
    message: 'It works!'
  })

  // For coverage
  server.close(() => {
    console.log('Closed') // eslint-disable-line no-console
  })
})
