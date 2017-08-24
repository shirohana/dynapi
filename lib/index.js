import * as core from './core'
import * as builder from './builder'
import * as common from './common'
import factory from './factory'
import singleton from './singleton'

export default Object.assign({ factory, singleton }, core, builder, common)
