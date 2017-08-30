import test from 'ava'
import { join, relative } from 'path'
import { Dynapi } from '../index.js'

test('redirectTo(type, filename)', t => {
  const dynapi = new Dynapi()
  const redirectTo = dynapi.redirectTo.bind(dynapi)
  const { srcDir, buildDir, apiDir, buildApiDir } = dynapi.options

  let filename = 'user/get.js'
  let src = join(apiDir, filename)
  let dest = join(buildApiDir, filename)
  t.is(redirectTo('buildApi', src), dest, 'src/api/get.js -> build/api/get.js')

  dest = join(buildDir, relative(srcDir, src))
  t.is(redirectTo('build', src), dest, 'src/**/*.js -> build/**/*.js')

  src = join(buildApiDir, filename)
  dest = join(apiDir, filename)
  t.is(redirectTo('api', src), dest, 'build/api/get.js -> src/api/get.js')

  dest = join(srcDir, relative(buildDir, src))
  t.is(redirectTo('src', src), dest, 'build/**/*.js -> src/**/*.js')
})
