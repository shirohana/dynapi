const productionMode = process.env.NODE_ENV === 'production'

const ESCAPE_STRING_REGEXP = /[\\^$*+?.|()[\\]{}]/g
const ESCAPE_PARAM_REGEXP = /\\(.)|:(\w+)/g
const ESCAPE_CAPTURING_REGEXP = /(\\.)|(\((?!\?[:=!]))/g
export const FILENAME_PATHS_REGEXP = /([\w:-]+|\([^)]+\))/g
export const RESOLVE_ALIAS_REGEXP = /^(?:~(\w*)\/?|(?=[.]{1,2}\/))(.*)$/

const parsePath = (productionMode ? _pathToTokens : _cachedPathToTokens)

// TODO Remove deprecated codes
const ESCAPE_POS_CHAR_REGEXP = /(\\.|\[\^)|([$^])/g
function removePosChars (str) {
  return str.replace(ESCAPE_POS_CHAR_REGEXP, (matched, escaped, posChar) => {
    if (posChar) { return '' }
    return matched
  })
}

export function flattenRegexp (regex) {
  if (!(regex instanceof RegExp)) {
    return undefined
  }

  let str = regex.source

  // TODO Remove deprecated codes
  const removed = removePosChars(str)
  if (!productionMode && str.length !== removed.length) {
    // eslint-disable-next-line no-console
    console.warn('\n' +
      '> WARNING!\n' +
      "> Don't use position metacharacters (like '^', '$') in `pattern` property of Parameter files.\n")
  }

  str = escapeCapturing(removed)
  return str
}

export function paramsOfPath (path) {
  const tokens = parsePath(path)
  if (tokens.length === 0) {
    return tokens
  } else {
    return tokens.filter(t => typeof t === 'object').map(t => t.name)
  }
}

export function pathToRegexp (path, params) {
  const tokens = parsePath(path)
  const patternParts = tokens.map((token, index) => {
    if (typeof token === 'string') {
      return escapeString(token)
    } else {
      const param = params && params[token.name]

      if (param && param.pattern) {
        return `(${param.pattern})`
      } else if (typeof tokens[index + 1] === 'string') {
        return `([^${tokens[index + 1][0]}])`
      } else {
        return '(.+)'
      }
    }
  })

  const patternString = patternParts.join('')
  return new RegExp(`^${patternString}$`)
}

export function generateFilenameRegexp ({ prefixes, extensions }) {
  const prefixValues = Object.keys(prefixes).map(k => prefixes[k]).filter(v => typeof v === 'string')
  const prefix = ['[a-z]+', ...prefixValues].join('|')
  const ext = extensions.join('|')
  return new RegExp(`^(${prefix})(.*?)?\\.(${ext})$`)
}

function escapeString (str) {
  return str.replace(ESCAPE_STRING_REGEXP, '\\$&')
}

function escapeCapturing (str) {
  return str.replace(ESCAPE_CAPTURING_REGEXP, (matched, escaped, capture) => {
    if (escaped) {
      return escaped
    } else {
      return '(?:'
    }
  })
}

function _pathToTokens (path) {
  const tokens = []
  let offset = 0
  let result

  while ((result = ESCAPE_PARAM_REGEXP.exec(path)) !== null) {
    const [matched, escaped, name] = result

    if (result.index > offset) {
      tokens.push(path.slice(offset, result.index))
    }

    if (escaped) {
      const lastIndex = tokens.length - 1

      if (typeof tokens[lastIndex] === 'string') {
        tokens[lastIndex] = tokens[lastIndex] + escaped
      } else {
        tokens.push(escaped)
      }
    } else {
      tokens.push({ name })
    }

    offset = result.index + matched.length
  }

  if (offset + 1 < path.length) {
    tokens.push(path.slice(offset))
  }

  return tokens
}

function _cachedPathToTokens (path) {
  // TODO Use WeakMap or lru-cache?
  return _pathToTokens(path)
}
