export function printError (err, filename) {
  /* eslint-disable no-console */
  if (err._babel) {
    console.error(`\n${err.message}\n${err.codeFrame}\n`)
  } else if (typeof err.stack === 'string') {
    filename = filename || err.filename
    let stack = err.stack

    // Capture error stack from caller (filename)
    if (typeof filename === 'string') {
      const firstNewline = stack.indexOf('\n')
      const filenameIndex = stack.lastIndexOf(filename)
      if (filenameIndex > firstNewline) {
        stack = stack.slice(0, stack.indexOf('\n', filenameIndex))
      }
    }

    console.error(`\n${stack}\n`)
  } else if (typeof err.message === 'string') {
    console.error(`\n${err.message}\n`)
  } else {
    console.error('\n', err, '\n')
  }
  /* eslint-enable no-console */
}
