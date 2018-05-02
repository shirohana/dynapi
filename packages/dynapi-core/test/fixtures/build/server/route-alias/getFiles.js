import glob from 'glob'

export default (req, res) => {
  res.send(glob.sync('*', { cwd: __dirname }).join(','))
}
