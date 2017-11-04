export function printError (err, filepath) {
  /* eslint-disable no-console */
  if (err._babel) {
    console.error(`\n${err.message}\n${err.codeFrame}\n`)
  } else if (typeof err.stack === 'string') {
    filepath = filepath || err.filepath
    let lines = err.stack

    /* istanbul ignore else : Slice error stack until filepath */
    if (typeof filepath === 'string') {
      const firstNewline = lines.indexOf('\n')
      const filenameIndex = lines.lastIndexOf(filepath)

      /* istanbul ignore else */
      if (filenameIndex > firstNewline) {
        lines = lines.slice(0, lines.indexOf('\n', filenameIndex))
      }
    }

    console.error(`\n${lines}\n`)
  } else if (typeof err.message === 'string') {
    console.error(`\n${err.message}\n`)
  } else {
    console.error('\n', err, '\n')
  }
  /* eslint-enable no-console */
}
