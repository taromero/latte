var figures = require('figures')
var colors = require('colors/safe')

module.exports = {
  it (label, fn, options) {
    const T = this

    // don't run `it` blocks when analyzing
    if (T.analyzing) return

    options = options || {}
    var msg = T.message('it', label, T.deepLevel) // generate msg for reports

    // if there's any `iit` block
    if (T.onlyRootDescribeBlocksForIit.length) {
      // only run `iit` blocks
      if (!options.runOnly) return
    }

    while (T.describeMessages.length) {
      // only print `describe` labels if their nested `it` blocks get executed
      console.log(T.describeMessages.shift())
    }

    T.itCount++ // count number of tests, for reports
    try {
      T.itBlockRunLevel = T.deepLevel
      T.beforeEachBlocks.map(fns).forEach(exec) // run beforeEach blocks
      fn() // run assertions in it block
      T.afterEachBlocks.map(fns).forEach(exec) // run afterEach blocks
      T.successfulItCount++ // count number of successful tests, for reports
      T.log(colors.green(msg + ' ' + figures.tick)) // log into stdout tests label and result
    } catch (e) {
      if (
        e.message ===
        "It's ok  to display this error, it's part of a test -12344321-"
      ) {
        // testing purposes
        T.successfulItCount++ // count number of successful tests, for reports
      } else {
        // normal flow
        T.log(colors.red(msg + ' ' + figures.cross))
        T.log(e.stack || e)
        T.exceptions.push(e) // if `T.exceptions` has any item at the en of the test run, exit code will be != 0
      }
    } finally {
      T.cleanUpDb()
    }
  },
  iit (label, fn, options) {
    const T = this
    if (T.analyzing) {
      if (
        !T.onlyRootDescribeBlocksForIit.includes(T.currentRootDescribeBlock)
      ) {
        // Only if we have not already added the root describe.
        // keeping track of the root describe allows us to run all before/after hooks from the beginning.
        // This also allows to print all labels from the beginning.
        T.onlyRootDescribeBlocksForIit.push(T.currentRootDescribeBlock)
      }
    }
    options = options || {}
    T.it(label, fn, Object.assign({}, options, { runOnly: true }))
  }
}

function fns (obj) {
  return obj.fn
}

function exec (fn) {
  fn()
}
