'use strict'

const babel = require('gulp-babel')
const chalk = require('chalk')
const gulp = require('gulp')
const gutil = require('gulp-util')
const merge = require('merge-stream')
const newer = require('gulp-newer')
const path = require('path')
const plumber = require('gulp-plumber')
const through = require('through2')
const gulpWatch = require('gulp-watch')

const sources = ['packages']

function errorLogger () {
  return plumber({ errorHandler: (err) => gutil.log(err.stack) })
}

function compilationLogger () {
  return through.obj(function (file, enc, callback) {
    gutil.log(`Compiling '${chalk.cyan(file.relative)}'`)
    callback(null, file)
  })
}

function rename (fn) {
  return through.obj(function (file, enc, callback) {
    file.path = fn(file)
    callback(null, file)
  })
}

function globOfSource (source) {
  return `./${source}/*/src/**/*.js`
}

function srcToLib (src) {
  const parts = src.split(path.sep)
  parts[1] = 'lib'
  return parts.join(path.sep)
}

function buildDynapi () {
  return merge(
    sources.map(source => {
      const base = path.join(__dirname, source)
      return gulp.src(globOfSource(source), { base: base })
        .pipe(errorLogger())
        .pipe(newer({ dest: base, map: srcToLib }))
        .pipe(compilationLogger())
        .pipe(babel())
        .pipe(rename(file => path.resolve(file.base, srcToLib(file.relative))))
        .pipe(gulp.dest(base))
    })
  )
}

gulp.task('build', () => buildDynapi())

gulp.task('watch', gulp.series('build', function watch () {
  gulpWatch(sources.map(globOfSource), { debounceDelay: 200 }, gulp.task('build'))
}))

gulp.task('default', gulp.series('build'))
