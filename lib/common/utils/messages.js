export function printError (err, filename) {
  let message

  if (err._babel) {
    message = `${err.message}\n${err.codeFrame}`
  } else if (typeof err.stack === 'string') {
    filename = filename || err.filename
    let lines = err.stack

    /* istanbul ignore else */
    if (typeof filename === 'string') {
      const firstLF = lines.indexOf('\n')
      const filenameIndex = lines.lastIndexOf(filename)

      /* istanbul ignore else */
      if (filenameIndex > firstLF) {
        lines = lines.slice(0, lines.indexOf('\n', filenameIndex))
      }
    }

    message = lines
  } else if (typeof err.message === 'string') {
    message = err.message
  } else {
    message = err
  }

  console.error(`\n${message}\n`) // eslint-disable-line no-console
}
