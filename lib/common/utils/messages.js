export function printError (err, filename) {
  /* eslint-disable no-console */
  if (err._babel) {
    console.error(`\n${err.message}\n${err.codeFrame}\n`)
  } else {
    let stack = err.stack
    if (typeof filename === 'string') {
      // Cut error stack from caller (filename)
      stack = stack.slice(0, stack.indexOf('\n', stack.lastIndexOf(filename)))
    }
    console.error(`\n${stack}\n`)
  }
  /* eslint-enable no-console */
}
