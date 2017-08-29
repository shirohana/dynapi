import test from 'ava'
import { join } from 'path'
import fs from 'fs-extra'
import request from 'supertest'
import nrequire from 'native-require'

process.env.DEBUG = 'api:*'

const rootDir = join(__dirname, './fixtures/watch')
const apiDir = join(rootDir, 'api~')
const _require = nrequire.from(rootDir)

const r = (p) => join(rootDir, p)
const api = (p) => join(apiDir, p)

let port = 3120
let server = null

test.before(async () => {
  process.env.dynapi_test_port = port++

  await fs.remove(r('./api~'))
  await fs.copy(r('./api'), r('./api~'))

  server = await _require('./server-express')()
})

test.serial('Before modify files', async t => {
  await request(server)
    .get('/api')
    .expect(200)

  await request(server)
    .post('/api')
    .expect(404)

  t.pass()
})

test.serial('Moving files', async t => {
  await fs.move(api('get.js'), api('post.js'))
  await new Promise(resolve => setTimeout(resolve, 1000)) // Delay for file watcher

  t.pass()
})

test.serial('After modify files', async t => {
  await request(server)
    .get('/api')
    .expect(404)

  await request(server)
    .post('/api')
    .expect(200)

  t.pass()
})

test.after(async () => {
  server.close()

  await server.dynapi.close()
  await fs.remove(r('./api~'))
})
