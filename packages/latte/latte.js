var figures = Npm.require('figures')

T = { // eslint-disable-line
  analize: function () { // this lets us analyze suite's structure to act accordingly later (allowing, for example, iit blocks to work)
    T.analyzing = true
    T.suites.forEach(exec)
    T.analyzing = false
  },
  run: function () {
    if (!process.env.RUN_TESTS) { return } // only run tests when explicitly told so

    var testingDB = new global.MongoInternals.RemoteCollectionDriver(T.testingDbUrl) // create a driver pointing to testing's DB
    getCollections().forEach(pointToTestingDB) // point collections to testing's DB
    getCollections().forEach(removeAll) // erase date on testing DB (though there should be none)

    // Run specs
    T.onlyRootDescribeBlocksForIit.length ? T.onlyRootDescribeBlocksForIit.forEach(exec) : T.suites.forEach(exec) // if there's `iit` blocks, only run those

    // output number of successful over total tests
    log('\n' + (T.itCount + ' tests: ').yellow + (T.successfulItCount + ' passing, ').green + (T.itCount - T.successfulItCount + ' failing.').red)

    getCollections().forEach(pointBackToDevelopDB) // point collections back to development's DB
    _(T.postRunCallbacks).reject(preventsSuiteFromRunning).map(fns).forEach(exec) // allow to run a callback when testing has finished (before possibly ending the process)

    process.env.RUN_TESTS !== 'cont' && process.exit(T.exceptions.length) // end the process unless option is specified

    function pointToTestingDB (collection) {
      collection.latte_original_driver = collection._driver // keep track of original driver, to point back to development's DB once tests have finished
      collection._driver = testingDB
      collection._driver.open(collection._name, collection._connection)
    }

    function pointBackToDevelopDB (collection) {
      collection.latte_original_driver.open(collection._name, collection._connection)
    }
  },
  describe: descriptionBlock('describe'),
  context: descriptionBlock('context'),
  ddescribe: descriptionBlock('describe', { runOnly: true }),
  ccontext: descriptionBlock('context', { runOnly: true }),
  iit: function (label, fn, options) {
    if (T.analyzing) {
      if (!_(T.onlyRootDescribeBlocksForIit).contains(T.currentRootDescribeBlock)) { // only if we have not already added the root describe
        // keeping track of the root describe allows us to run all before/after hooks from the beginning.
        // This also allows to print all labels from the beginning
        T.onlyRootDescribeBlocksForIit.push(T.currentRootDescribeBlock)
      }
    }
    options = options || {}
    T.it(label, fn, _(options).extend({ runOnly: true }))
  },
  it: function (label, fn, options) {
    if (T.analyzing) { return } // don't run `it` blocks when analyzing
    options = options || {}
    var msg = T.message('it', label, T.deepLevel) // generate msg for reports

    if (T.onlyRootDescribeBlocksForIit.length) { // if there's any `iit` block
      if (!options.runOnly) { return } // only run `iit` blocks
      msg = msg.underline
    }

    while (T.describeMessages.length) { // only print `describe` labels if their nested `it` blocks get executed
      console.log(T.describeMessages.shift())
    }

    T.itCount++ // count number of tests, for reports
    try {
      T.itBlockRunLevel = T.deepLevel
      T.beforeEachBlocks.map(fns).forEach(exec) // run beforeEach blocks
      fn()                                      // run assertions in it block
      T.afterEachBlocks.map(fns).forEach(exec)  // run afterEach blocks
      T.successfulItCount++                     // count number of successful tests, for reports
      log((msg + ' ' + figures.tick.green))                 // log into stdout tests label and result
      getCollections().forEach(removeAll)
    } catch (e) {
      log(msg + ' ' + figures.cross.red)
      log(e.stack || e)
      T.exceptions.push(e)                      // if `T.exceptions` has any item at the en of the test run, exit code will be != 0
    }
  },
  message: function (type, label, deepLevel) { // pretty print messages for console report
    var prefix = ''
    if (T.deepLevel === 0) { prefix += '~~~~~~~~'.grey + '\n' }
    prefix += _.range(deepLevel).reduce(addIndentation, '')
    return prefix + type.magenta.bold + ' ' + label.cyan

    function addIndentation (space) {
      return space + '  '
    }
  },
  ignore: function () {},
  suites: [],
  postRunCallbacks: [],
  describeBlocks: [],
  exceptions: [],
  deepLevel: 0,
  horizontalLevel: 0,
  itCount: 0,
  successfulItCount: 0,
  onlyRootDescribeBlocksForIit: [],
  describeMessages: [],
  itBlockRunLevel: 0,
  isFirstAddedSuite: true,
  analyzing: true,
  onlySuites: [],
  _contextBlocks: ['beforeEach', 'afterEach'],
  testingDbUrl: 'mongodb://127.0.0.1:3001/meteor_latte'
}

addContextBlocks() // adds before/after each/all functions

if (process.env.LATTE_SUITES) {
  T.onlySuites = T.onlySuites.concat(JSON.parse(process.env.LATTE_SUITES))
  if (T.onlySuites.length) {
    T.onlySuitesAsUserParams = true // if user specifies some suites to run, only run those
  }
}

function fns (obj) { return obj.fn }

function exec (fn) { fn() }

function removeAll (collection) { collection.remove({}) }

function descriptionBlock (type, options) {
  if (!process.env.RUN_TESTS) { return function () {} } // don't run any test related stuff unless explicitly told so
  options = options || {}

  return function analyzeOrExec (label, fn) {
    if (T.deepLevel === 0 && options.runOnly && !excludedSuite(T.onlySuites, label) && !T.onlySuitesAsUserParams) { T.onlySuites.push(label) }
    if (T.deepLevel === 0 && preventsSuiteFromRunning(label)) { return }

    return (T.analyzing ? analizeBlock(label, fn) : describeBlock(label, fn))
  }

  function analizeBlock (label, fn) {
    if (T.deepLevel === 0) {
      var testSuite = describeBlock.bind(this, label, fn)
      T.currentRootDescribeBlock = testSuite
      T.suites.push(testSuite)
      T.isFirstAddedSuite && Meteor.startup(function () { // upon first suite addition, add a callback to startup to run tests
        T.analize() // look at suites structure and prepare the test run (this allows, for example, iit behavior)
        T.run() // run code defined inside suites (describe blocks)
      })
      T.isFirstAddedSuite = false
    }
    T.deepLevel++
    fn()
    T.deepLevel--
  }

  function describeBlock (label, fn) {
    if (T.deepLevel === 0 && preventsSuiteFromRunning(label)) { return }
    T.describeMessages.push(T.message(type, label, T.deepLevel))
    T.deepLevel++
    fn()
    T.itBlockRunLevel = T.deepLevel
    T.describeMessages = []
    T._contextBlocks.forEach(filterFromSameLevel)
    T.deepLevel--
  }

  function filterFromSameLevel (blockName) {
    T[blockName + 'Blocks'] = T[blockName + 'Blocks'].filter(differentLevel)

    function differentLevel (obj) {
      return obj.deepLevel !== T.deepLevel
    }
  }
}

function preventsSuiteFromRunning (label) {
  if (label.label) { label = label.label } // allows to pass { label: '...', fn: ... } as arg
  return excludedSuite(label) || (T.onlySuites.some(isInclusionOnly) && !T.onlySuites.some(included))

  function isInclusionOnly (onlySuite) {
    return !startsWith(onlySuite, '~')
  }

  function included (onlySuite) {
    return onlySuite === label
  }
}

function excludedSuite (label) {
  return T.onlySuites.some(excluded)

  function excluded (onlySuite) {
    if (startsWith(onlySuite, '~')) {
      if (onlySuite.replace('~', '') === label) {
        return true
      }
    }
  }
}

function log (obj) {
  !T.analyzing && console.log(obj) // prevent logging while analyzing the suites
}

function startsWith (str, needle) {
  return str.indexOf(needle) === 0
}

function getCollections () {
  return Object.keys(global)
    .map(toGlobalObject)
    .filter(nonMeteorCollections)
    .concat([Meteor.users])

  function toGlobalObject (key) {
    return global[key]
  }

  function nonMeteorCollections (globalObject) {
    return globalObject instanceof Meteor.Collection
  }
}

function addContextBlocks () {
  T._contextBlocks.forEach(addContextBlock)

  function addContextBlock (blockName) {
    T[blockName + 'Blocks'] = []
    T[blockName] = function (fn) {
      if (T.analyzing) { return }
      T[blockName + 'Blocks'].push({ fn: fn, deepLevel: T.deepLevel })
    }
  }
}

// Global variables are not attached to the `global` object in Meteor packages, so we ignore style checker for this section.
// Details: http://stackoverflow.com/questions/31526454/global-variables-not-being-attached-to-the-global-object-on-meteorjs-packages

/*eslint-disable */
describe = T.describe.bind(T)
context = T.context.bind(T)
it = T.it.bind(T)
iit = T.iit.bind(T)
beforeEach = T.beforeEach.bind(T)
afterEach = T.afterEach.bind(T)
ddescribe = T.ddescribe.bind(T)
ccontext = T.ccontext.bind(T)
/*eslint-enable */

