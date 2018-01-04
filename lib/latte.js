const colors = require('colors/safe')
colors.enabled = true

const db = require('./db')
const defaults = require('./defaults')
const it = require('./it')
const describe = require('./describe')
const message = require('./message')

const exec = fn => fn()

const T = {
  test () {
    T.analize()
    T.run()
  },
  // this lets us analyze suite's structure to act accordingly later (allowing, for example, iit blocks to work)
  analize () {
    T.analyzing = true
    T.suites.forEach(exec)
    T.analyzing = false
  },
  // run code defined inside suites (describe blocks)
  run () {
    T.pointToTestingDB()
    T.cleanUpDb()

    T.globalBeforeAll()
    T.runSuites()
    T.globalAfterAll()

    T.logResults()
    db.pointBackToDevelopDB()
    T.execPostRunCallbacks()
    T.onExit()
  },
  runSuites () {
    T.onlyRootDescribeBlocksForIit.length
      ? T.onlyRootDescribeBlocksForIit.forEach(exec) // if there's `iit` blocks, only run those
      : T.suites.forEach(exec)
  },
  onExit () {
    process.env.LATTE_MODE !== 'watch' && process.exit(T.exceptions.length) // end the process unless option is specified
  },
  // allow to run a callback when testing has finished (before possibly ending the process)
  execPostRunCallbacks () {
    T.postRunCallbacks
      .filter(suite => !T.preventsSuiteFromRunning(suite))
      .map(obj => obj.fn)
      .forEach(exec)
  },
  log (obj) {
    // prevent logging while analyzing the suites
    !T.analyzing && console.log(obj)
  },
  logResults () {
    // output number of successful over total tests
    this.log(
      '\n' +
        colors.yellow(T.itCount + ' tests: ') +
        colors.green(T.successfulItCount + ' passing, ') +
        colors.red(T.itCount - T.successfulItCount + ' failing.')
    )
  },
  // adds before/after each/all functions
  addContextBlocks () {
    T._contextBlocks.forEach(addContextBlock)

    function addContextBlock (blockName) {
      T[blockName + 'Blocks'] = []
      T[blockName] = function (fn) {
        if (T.analyzing) {
          return
        }
        T[blockName + 'Blocks'].push({ fn: fn, deepLevel: T.deepLevel })
      }
    }
  },
  extendGlobal () {
    const globalMethods = [
      'describe',
      'context',
      'ddescribe',
      'ccontext',
      'it',
      'iit',
      'beforeEach',
      'afterEach'
    ]
    globalMethods.forEach(function (methodName) {
      global[methodName] = T[methodName].bind(T)
    })
  }
}

Object.assign(T, defaults)
Object.assign(T, describe)
Object.assign(T, it)
Object.assign(T, message)
Object.assign(T, db)

if (process.env.LATTE_SUITES) {
  T.onlySuites = T.onlySuites.concat(JSON.parse(process.env.LATTE_SUITES))
  if (T.onlySuites.length) {
    T.onlySuitesAsUserParams = true // if user specifies some suites to run, only run those
  }
}

T.addContextBlocks()
T.extendGlobal()

module.exports = T
