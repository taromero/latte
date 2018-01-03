const colors = require('colors/safe')

// pretty print messages for console report
module.exports = {
  message (type, label, deepLevel) {
    const T = this
    var prefix = ''
    if (T.deepLevel === 0) {
      prefix += colors.grey('~~~~~~~~') + '\n'
    }
    prefix += range(deepLevel).reduce(addIndentation, '')
    return prefix + colors.magenta.bold(type) + ' ' + colors.cyan(label)

    function addIndentation (space) {
      return space + '  '
    }
  }
}

function range (length) {
  return [...Array(length).keys()]
}
