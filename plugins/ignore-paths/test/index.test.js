import test from 'ava'
import request from 'supertest'
import _require from 'native-require'

process.on('unhandledRejection', err => {
  throw err
})

const createServer = _require.from(__dirname).require('./fixtures/server')
const paths = ['/a', '/b', '/a/b', '/b/a', '/a-b', '/b-a', '/a/b/a', '/b/a/b']

function runTest (t, server, results) {
  const promises = paths.map((path, i) => {
    return (async () => {
      const res = await server.get(path)
      const status = results[i] ? 200 : 404
      t.is(res.status, status, `GET ${path} should be ${status}`)
    })()
  })
  return Promise.all(promises)
}

test('Check dynapi works', async t => {
  const server = request(await createServer())
  const result = [1, 1, 1, 1, 1, 1, 1, 1]
  await runTest(t, server, result)
})

test('Should ignore filename', async t => {
  const server = request(await createServer({ plugins: [['ignore-paths', ['a']]] }))
  const result = [0, 1, 1, 0, 1, 1, 0, 1]
  await runTest(t, server, result)
})

test('Should ignore directory', async t => {
  const server = request(await createServer({ ignore: ['a/'] }))
  const result = [1, 1, 0, 1, 1, 1, 0, 0]
  await runTest(t, server, result)
})

test('Should ignore filename from root', async t => {
  const server = request(await createServer({ ignore: ['/a'] }))
  const result = [0, 1, 1, 1, 1, 1, 1, 1]
  await runTest(t, server, result)
})

test('Should ignore directory from root', async t => {
  const server = request(await createServer({ ignore: ['/a/'] }))
  const result = [1, 1, 0, 1, 1, 1, 0, 1]
  await runTest(t, server, result)
})

test('Should ignore RegExp', async t => {
  const server = request(await createServer({ ignore: [/^\/a/, /b$/] }))
  const result = [0, 0, 0, 1, 0, 1, 0, 0]
  await runTest(t, server, result)
})
