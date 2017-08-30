require('source-map-support').install()

const dynapi = require('./dist/dynapi')

exports = module.exports = dynapi['factory']

Object.keys(dynapi)
.filter(key => key !== 'factory')
.forEach(key => exports[key] = dynapi[key])
