inquirer = Npm.require('inquirer')
readline = Npm.require('readline')

function _debug (cb) {
  var _s = Error().stack
  var _c = arguments.callee.caller.toString()
  inquirer.prompt({ type: 'input', name: 'text', message: 'repl' }, repl)

  function repl (_input) {
    var input = _input.text
    if (input === 'c') {
      cb && cb('aa')
      return
    }
    try {
      console.log(eval(input))
    } catch (e) {
      console.log(input, 'is not defined.')
    }
    _debug()
  }
}

debug = '(' + _debug.toString() + ')()'
