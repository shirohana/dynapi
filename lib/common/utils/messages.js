export function printError (err, filename) {
  /* eslint-disable no-console */
  if (err._babel) {
    console.error(`\n${err.message}\n${err.codeFrame}\n`)
  } else if (typeof err.stack === 'string') {
    filename = filename || err.filename
    let stack = err.stack
    if (typeof filename === 'string') {
      // Capture error stack from caller (filename)
      stack = stack.slice(0, stack.indexOf('\n', stack.lastIndexOf(filename)))
    }
    console.error(`\n${stack}\n`)
  } else {
    console.error(`\n${err}\n`)
  }
  /* eslint-enable no-console */
}
