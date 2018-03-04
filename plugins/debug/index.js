const chalk = require('chalk')
const debug = require('debug')

const counter = {
  value: 0,
  get next () {
    return ++this.value
  }
}

function dynapiPluginDebug (options) {
  // Shallow copy
  const opt = Object.assign({}, options)
  opt.enabled = (typeof opt.enabled === 'boolean' ? opt.enabled : process.env.NODE_ENV !== 'production')
  opt.prefix = (typeof opt.prefix === 'string' ? opt.prefix : 'api_' + counter.next)

  function plugin (router) {
    if (!opt.enabled) {
      return
    }

    const _render = debugOf(opt.prefix, 'request', opt.color)

    router.plugin('request', (req, res) => {
      if (_render.enabled) {
        const time = chalk.red(currentTime())
        const method = chalk.cyan(req.method)
        const url = chalk.green(req.url)
        _render(`${time} ${method} ${url}`)
      }
    })
  }

  return plugin
}

exports = module.exports = dynapiPluginDebug

exports.name = 'dynapi-plugin-debug'

exports.availables = {
  Router: true
}

function debugOf (prefix, suffix, color) {
  const ctx = debug(`${prefix}:${suffix}`)
  ctx.color = color || ctx.color
  return ctx
}

const p2 = (n) => ('00' + n).slice(-2)

function currentTime () {
  const now = new Date()
  return `${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`
}
