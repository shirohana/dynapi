import test from 'ava'
import request from 'supertest'
import _require from 'native-require'

process.on('unhandledRejection', err => {
  throw err
})

const fixture = _require.from('./fixtures/option-loose')
const createServer = fixture.require('./server')

let server, looseServer

test.before(async () => {
  server = request(await createServer({ loose: false }))
  looseServer = request(await createServer({ loose: true }))
})

test('Should 404 when loose is false', async t => {
  let res = await server.get('/')
  t.is(res.status, 200)
  t.is(res.text, 'Responsed from dynapi')

  res = await server.post('/')
  t.is(res.status, 404)
})

test('Should next() when loose is true', async t => {
  let res = await looseServer.get('/')
  t.is(res.status, 200)
  t.is(res.text, 'Responsed from dynapi')

  res = await looseServer.post('/')
  t.is(res.status, 200)
  t.is(res.text, 'Responsed from the next middleware')
})
