import test from 'ava'
import { join } from 'path'
import fs from 'fs-extra'
import request from 'supertest'
import nrequire from 'native-require'

const rootDir = join(__dirname, './fixtures/watch')

const r = (p) => join(rootDir, p)
const resource = (p) => join(rootDir, 'resources', p)

let server = null
let watcher = null // To be closed

const run = async (callback) => {
  callback()
  await new Promise(resolve => setTimeout(resolve, 400))
}

test.before(async () => {
  // Clean up working directory for previous broken test
  await Promise.all([
    fs.remove(r('api')),
    fs.remove(r('controller')),
    fs.remove(r('error'))
  ])

  await Promise.all([
    fs.copy(resource('api'), r('api')),
    fs.copy(resource('controller'), r('controller')),
    fs.copy(resource('error'), r('error'))
  ])

  const app = await nrequire.from(rootDir)('./server-express')()
  server = request(app)
  watcher = app.watcher

  // I don't know why it works :(
  if (/^linux/.test(process.platform)) {
    await run(() => fs.appendFileSync(r('api/get.js'), '\n// Touched\n'))
  }
})

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
  await watcher.close()
  await Promise.all([
    fs.remove(r('api')),
    fs.remove(r('controller')),
    fs.remove(r('error'))
  ])
})
