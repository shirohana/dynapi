import { join } from 'path'
import test from 'ava'
import request from 'supertest'
import _require from 'native-require'
import fs from 'fs-extra'

process.on('unhandledRejection', err => {
  throw err
})

async function run (promise) {
  await promise
  await new Promise(resolve => setTimeout(resolve, 400))
}

const serverDir = join(__dirname, 'fixtures/watch/server')
const resourceDir = join(__dirname, 'fixtures/watch/resources')
const s = (p) => join(serverDir, p)
const r = (p) => join(resourceDir, p)

const createServer = _require.from(__dirname).require('./fixtures/watch/server')
let server

test.before(async () => {
  fs.removeSync(serverDir)
  fs.copySync(r('server'), serverDir)

  server = request(await createServer())

  // I don't know why it works :(
  if (/^linux/.test(process.platform)) {
    fs.appendFileSync(s('routes/get.js'))
  }
})

test.after(async () => {
  createServer.closeAll()
  fs.removeSync(serverDir)
})

test('Should handle exists Responsers', async t => {
  t.plan(2)
  await Promise.all([
    (async () => {
      const res = await server.get('/')
      t.is(res.text, 'Homepage')
    })(),
    (async () => {
      const res = await server.get('/pi')
      t.is(res.status, 500)
    })()
  ])
})

test('Should handle new Responser', async t => {
  let res = await server.post('/')
  t.is(res.status, 404)

  await run(fs.copy(r('post.js'), s('routes/post.js')))
  res = await server.post('/')
  t.is(res.text, 'New Responser!')

  await run(fs.remove(s('routes/post.js')))
  res = await server.post('/')
  t.is(res.status, 404)
})

test('Should watch files outside `routes`', async t => {
  let res = await server.get('/user/Hana')
  t.is(res.status, 404)

  await run(fs.copy(r('user1.js'), s('models/user.js')))
  await run(fs.copy(r('getUser(:name).js'), s('routes/getUser(:name).js')))
  res = await server.get('/user/Hana')
  t.is(res.text, 'Hello, Hana')

  await run(fs.copy(r('user2.js'), s('models/user.js')))
  res = await server.get('/user/Hana')
  t.is(res.text, 'Hello, I\'m Hana')
})

test('Should 500 when build Responsers failure', async t => {
  let res = await server.get('/broken-1')
  t.is(res.status, 404)

  await run(fs.copy(r('broken-responser.js'), s('routes/getBroken1.js')))
  // It will print error stack two times, one when build time, one when requested
  res = await server.get('/broken-1')
  t.is(res.status, 500)
})

test('Should 500 when build Middlewares failure', async t => {
  let res = await server.get('/broken-2')
  t.is(res.status, 404)

  await run(fs.copy(r('broken-middleware.js'), s('routes/broken-2/>0.js')))
  // It will print error stack two times, one when build time, one when requested
  res = await server.get('/broken-2')
  t.is(res.status, 500)
})

/*

test.serial('Check initial status', async t => {
  t.is((await server.get('/api')).status, 200)
  t.is((await server.post('/api')).status, 404)
  t.is((await server.get('/api/user/5')).status, 200)
  t.is((await server.get('/api/user/12')).status, 404)
})

test.serial('Create new responser', async t => {
  // Before create responser
  let res = await server.post('/api')
  t.is(res.status, 404)

  // Create responser which contains SyntaxError
  await run(() => fs.copySync(resource('post-simple-syntax-error.js'), r('api/post.js')))

  res = await server.post('/api')
  t.is(res.status, 500)

  // Create responser which works correctly
  await run(() => fs.copySync(resource('post-simple.js'), r('api/post.js')))

  res = await server.post('/api')
  t.is(res.status, 200)
  t.deepEqual(res.body, { message: 'POST /api' })

  // Remove created responser
  await run(() => fs.removeSync(r('api/post.js')))

  res = await server.post('/api')
  t.is(res.status, 404)
})

test.serial('Create new middleware', async t => {
  // Before create middleware
  let res = await server.get('/api')
  t.is(res.status, 200)

  // Create middleware which reject all request by 403
  await run(() => fs.copySync(resource('>reject.js'), r('api/>reject.js')))

  res = await server.get('/api')
  t.is(res.status, 403)

  // Add ignore property to 'reject-all-middleware'
  await run(() => fs.appendFileSync(r('/api/>reject.js'), '\nexport const ignore = true\n'))

  res = await server.get('/api')
  t.is(res.status, 200)

  // Add broken middleware which cause 500 when requests through by
  // Use unnamed middleware for coverage
  await run(() => fs.copySync(resource('>broken.js'), r('api/>.js')))

  res = await server.get('/api')
  t.is(res.status, 500)

  await run(() => fs.removeSync(r('api/>.js')))

  res = await server.get('/api')
  t.is(res.status, 200)
})

test.serial('Simulate response timeout', async t => {
  // Before breaking time
  let res = await server.post('/api/user/shirohana')
  t.is(res.status, 200)
  t.deepEqual(res.body, {
    username: 'shirohana',
    nickname: 'Hana Shiro'
  })

  res = await server.post('/api/user/another-user')
  t.is(res.status, 400) // Response a specified status code

  await run(() => fs.copySync(resource('higher-query-delay.js'), r('controller/query-delay.js')))

  res = await server.post('/api/user/shirohana')
  t.is(res.status, 408)
})

test.serial('Remove parameter', async t => {
  let res = await server.get('/api/user/2')
  t.is(res.status, 200)
  t.deepEqual(res.body, {
    message: 'GET /api/user/2'
  })

  // Remove parameter for coverage
  await run(() => fs.removeSync(r('api/user/&userId.js')))

  res = await server.get('/api/user/2')
  t.is(res.status, 200)
  t.deepEqual(res.body, {
    message: 'GET /api/user/'
  })
})

test.after(async () => {
  await Promise.all([
    fs.remove(r('api')),
    fs.remove(r('controller')),
    fs.remove(r('error'))
  ])
})

*/
