const chalk = require('./utils/chalk')

// pretty print messages for console report
module.exports = {
  message (type, label, deepLevel) {
    const T = this
    var prefix = ''
    if (T.deepLevel === 0) {
      prefix += chalk.grey('~~~~~~~~') + '\n'
    }
    prefix += range(deepLevel).reduce(addIndentation, '')
    return prefix + chalk.magenta.bold(type) + ' ' + chalk.cyan(label)

    function addIndentation (space) {
      return space + '  '
    }
  }
}

function range (length) {
  return [...Array(length).keys()]
}
