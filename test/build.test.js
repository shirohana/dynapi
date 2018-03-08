import test from 'ava'
import request from 'supertest'
import _require from 'native-require'

process.on('unhandledRejection', err => {
  throw err
})

const createServer = _require.from(__dirname).require('./fixtures/build/server')

let server

test.before(async () => {
  server = request(await createServer())
})

test('Should response a simple request', async t => {
  const res = await server.get('/')
  t.is(res.status, 200)
  t.is(res.text, 'Homepage')
})

test('Should 404 if method/path was not found', async t => {
  const res = await server.put('/')
  t.is(res.status, 404)
})

test('Should handle nested static routes', async t => {
  t.plan(3)
  await Promise.all([
    (async () => {
      const res = await server.get('/a')
      t.is(res.text, 'GET /a')
    })(),
    (async () => {
      const res = await server.get('/a/b')
      t.is(res.text, 'GET /a/b')
    })(),
    (async () => {
      const res = await server.get('/a/b/c')
      t.is(res.text, 'GET /a/b/c')
    })()
  ])
})

test('Should process middlewares', async t => {
  const res = await server.get('/m1')
  t.is(res.text, 'm1/>0')
})

test('Throw errors in middlewares', async t => {
  t.plan(4)
  await Promise.all([
    (async () => {
      const res = await server.get('/m2')
      t.is(res.text, 'GET will response 200')
    })(),
    (async () => {
      const res = await server.post('/m2')
      t.is(res.status, 500, 'Throw 500 in default')
    })(),
    (async () => {
      const res = await server.put('/m2')
      t.is(res.status, 400, 'Specify status code')
    })(),
    (async () => {
      const res = await server.patch('/m2')
      t.is(res.status, 401, 'Throw literal status code')
    })()
  ])
})

test('Should handle routes which contain params', async t => {
  t.plan(2)
  await Promise.all([
    (async () => {
      const res = await server.get('/p1/meow')
      t.is(res.text, 'Hello, meow. GET /p1/meow')
    })(),
    (async () => {
      const res = await server.get('/p1/nyan')
      t.is(res.text, 'Hello, nyan. GET /p1/nyan')
    })()
  ])
})

test('Should according to the `pattern` export of Paramter to choose correct path', async t => {
  t.plan(2)
  await Promise.all([
    (async () => {
      const res = await server.get('/p2/0608')
      t.is(res.text, 'Is decimal')
    })(),
    (async () => {
      const res = await server.get('/p2/0x2aff')
      t.is(res.text, 'Is hexadecimal')
    })()
  ])
})

test('Should work with complex route name', async t => {
  t.plan(2)
  await Promise.all([
    (async () => {
      const res = await server.get('/p3/prefix-suf-fix')
      t.is(res.text, 'Reversed: suf-fix-prefix')
    })(),
    (async () => {
      const res = await server.get('/p3/not:match')
      t.is(res.status, 404)
    })()
  ])
})

test('Should handle complex filename', async t => {
  t.plan(4)
  await Promise.all([
    (async () => {
      const res = await server.get('/complex/a-b')
      t.is(res.text, 'get-a-b')
    })(),
    (async () => {
      const res = await server.get('/complex/ab')
      t.is(res.text, 'getAB')
    })(),
    (async () => {
      const res = await server.get('/complex/a')
      t.is(res.text, 'get(a)')
    })(),
    (async () => {
      const res = await server.get('/complex/a/b')
      t.is(res.text, 'get(a)(b)')
    })()
  ])
})

test('Should resolve aliases', async t => {
  const res = await server.get('/user/3')
  t.is(res.text, 'User::3')
})

test('Should response errors when throw', async t => {
  const res = await server.get('/user/666')
  t.is(res.status, 404)
})

test('Should resolve modules', async t => {
  const res = await server.get('/user/files')
  t.is(res.text, ':id,getFiles.js')
})

test('Should 408 when next() was not be called', async t => {
  const res = await server.get('/racer/a')
  t.is(res.status, 408)
})

test('Should 408 when responser took too much time', async t => {
  t.plan(2)
  await Promise.all([
    (async () => {
      const res = await server.get('/racer/b/1')
      t.is(res.status, 408)
    })(),
    (async () => {
      const res = await server.get('/racer/b/2')
      t.is(res.status, 408)
    })()
  ])
})

test.only('Should allow custom builder plugins', async t => {
  const res = await server.get('/builder-plugins/pipeline-operator')
  t.is(res.text, 'Hello, hello!')
})
