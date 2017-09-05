import test from 'ava'
import { join } from 'path'
import fs from 'fs-extra'
import request from 'supertest'
import nrequire from 'native-require'

process.env.DEBUG = 'api:*'

const rootDir = join(__dirname, './fixtures/watch')
const _require = nrequire.from(rootDir)

const root = (p) => join(rootDir, p)
const route = (p) => join(rootDir, 'api', p)
const res = (p) => join(rootDir, 'resources', p)

const port = 3120
let server = null

const callbacks = []

const nextTick = async (callback) => {
  const tick = new Promise(resolve => callbacks.push(resolve))
  callback()
  await tick
}

test.before(async () => {
  process.env.dynapi_test_port = port

  // Clean up working directory for previous broken test
  await Promise.all([
    fs.remove(root('api')),
    fs.remove(root('controller')),
    fs.remove(root('error'))
  ])

  await Promise.all([
    fs.copy(res('api'), root('api')),
    fs.copy(res('controller'), root('controller')),
    fs.copy(res('error'), root('error'))
  ])

  server = await _require('./server-express')()
  const watcher = server.watcher.watcher

  // Internal watcher
  watcher.on('all', (event, filename) => {
    while (callbacks.length > 0) {
      callbacks.shift()(event, filename)
    }
  })
})

test.serial('Check initial status', async t => {
  await Promise.all([
    request(server).get('/api').expect(200),
    request(server).post('/api').expect(404),
    request(server).get('/api/user/5').expect(200),
    request(server).get('/api/user/12').expect(404)
  ])
  t.pass()
})

test.serial('Create new responser', async t => {
  // Pre-test
  await request(server).post('/api').expect(404)

  // Create /api/post.js
  await nextTick(() => fs.copySync(res('post-simple.js'), route('post.js')))

  await request(server).post('/api').expect(200).expect(({ body }) => t.is(body.message, 'POST /api'))

  // Remove /api/post.js
  await nextTick(() => fs.removeSync(route('post.js')))
  await request(server).post('/api').expect(404)
})

test.serial('Create new middleware', async t => {
  // Pre-test
  await request(server).get('/api').expect(200)

  // Create /api/middleware.js
  await nextTick(() => fs.copySync(res('middleware-reject.js'), route('middleware.js')))
  await request(server).get('/api').expect(404) // TODO Custom error message or status

  // Add `ignore` property in /api/middleware.js
  await nextTick(() => fs.appendFileSync(route('middleware.js'), '\nexport const ignore = true\n'))
  await request(server).get('/api').expect(200)

  t.pass()
})

test.serial('Simulate bad network environment', async t => {
  // Pre-test
  await request(server).post('/api/user/shirohana').expect(200).expect(({ body }) => {
    t.is(body.username, 'shirohana')
    t.is(body.nickname, 'Hana Shiro')
  })
  await request(server).post('/api/user/another-user').expect(400)

  await nextTick(() => fs.copySync(res('db-network-down.js'), root('controller/db.js')))
  await request(server).post('/api/user/shirohana').expect(408)

  t.pass()
})

test.after(async () => {
  server.close()

  await server.dynapi.close()
  await fs.remove(root('api'))
  await fs.remove(root('controller'))
  await fs.remove(root('error'))
})
