import test from 'ava'
import { join } from 'path'
import fs from 'fs-extra'
import request from 'supertest'
import nrequire from 'native-require'

const rootDir = join(__dirname, './fixtures/watch')

const r = (p) => join(rootDir, p)
const resource = (p) => join(rootDir, 'resources', p)

let server = null

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

  server = request(await nrequire.from(rootDir)('./server-express')())

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

  await run(() => fs.copySync(resource('post-simple.js'), r('api/post.js')))

  // After create responser
  res = await server.post('/api')
  t.is(res.status, 200)
  t.deepEqual(res.body, { message: 'POST /api' })

  await run(() => fs.removeSync(r('api/post.js')))

  // After remove created responser
  res = await server.post('/api')
  t.is(res.status, 404)
})

test.serial('Create new middleware', async t => {
  // Before create middleware
  let res = await server.get('/api')
  t.is(res.status, 200)

  await run(() => fs.copySync(resource('>reject.js'), r('api/>reject.js')))

  // TODO Custom error message or status
  // After create middleware
  res = await server.get('/api')
  t.is(res.status, 403)

  await run(() => fs.appendFileSync(r('/api/>reject.js'), '\nexport const ignore = true\n'))

  // After added property into created middleware
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

test.after(async () => {
  await Promise.all([
    fs.remove(r('api')),
    fs.remove(r('controller')),
    fs.remove(r('error'))
  ])
})
