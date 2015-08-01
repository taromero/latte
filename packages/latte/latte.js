var figures = Npm.require('figures')

T = { // eslint-disable-line
  run: function (onlySuites) {
    if (!process.env.RUN_TESTS) { return }
    if (onlySuites) { T.onlySuites = onlySuites }
    T.preProcess = false
    T.describeBlocks.forEach(exec)
    T.analyzing = false
    T.needToBoot = false

    var testingDB = new global.MongoInternals.RemoteCollectionDriver(T.testingDbUrl) // create a driver pointing to testing's DB
    getCollections().forEach(pointToTestingDB) // point collections to testing's DB
    getCollections().forEach(removeAll) // erase date on testing DB (though there should be none)

    T.onlyRootDescribeBlocksForIit.length ? T.onlyRootDescribeBlocksForIit.forEach(exec) : T.suites.forEach(exec) // if there's `iit` blocks, only run those

    // output number of successful over total tests
    log('\n' + (T.itCount + ' tests: ').yellow + (T.successfulItCount + ' passing, ').green + (T.itCount - T.successfulItCount + ' failing.').red)

    getCollections().forEach(pointBackToDevelopDB) // point collections back to development's DB
    _(T.postRunCallbacks).reject(preventsSuiteFromRunning).map(fns).forEach(exec) // allow to run a callback when testing has finished (before possibly ending the process)

    process.env.RUN_TESTS !== 'cont' && process.exit(T.exceptions.length) // end the process unless option is specified

    T.itCount = 0
    T.successfulItCount = 0
    T.analyzing = true
    T.needToBoot = true
    T.suites = []

    function pointToTestingDB (collection) {
      collection.latte_original_driver = collection._driver // keep track of original driver, to point back to development's DB once tests have finished
      collection._driver = testingDB
      collection._collection = collection._driver.open(collection._name, collection._connection)
    }

    function pointBackToDevelopDB (collection) {
      collection._collection = collection.latte_original_driver.open(collection._name, collection._connection)
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
      T.beforeAllBlocks.map(fns).forEach(exec)           // run beforeAll blocks
      T.beforeEachBlocks.map(fns).forEach(exec) // run beforeEach blocks
      T.beforeAllBlocks = []                    // empty beforeAll block array
      fn()                                      // run assertions in it block
      T.afterEachBlocks.map(fns).forEach(exec)  // run afterEach blocks
      T.successfulItCount++                     // count number of successful tests, for reports
      log((msg + ' ' + figures.tick.green))                 // log into stdout tests label and result
    } catch(e) {
      log(msg + ' ' + figures.cross.red)
      log(e.stack || e)
      T.exceptions.push(e)                      // if `T.exceptions` has any item at the en of the test run, exit code will be != 0
    }
  },
  defineHook: function (type) {
    return function (fn) {
      if (T.analyzing) { return }
      T[type + 'Blocks'].push({ fn: fn, deepLevel: T.deepLevel })
    }
  },
  message: function (type, label, deepLevel) { // pretty print messages for console report
    var prefix = ''
    if (T.deepLevel === 0) { prefix += '~~~~~~~~'.grey + '\n' }
    prefix += _.range(deepLevel).reduce(function (a) { return a + '  '}, '')
    return prefix + type.magenta.bold + ' ' + label.cyan
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
  beforeAllBlocks: [],
  afterAllBlocks: [],
  beforeEachBlocks: [],
  afterEachBlocks: [],
  onlyRootDescribeBlocksForIit: [],
  describeMessages: [],
  itBlockRunLevel: 0,
  needToBoot: true,
  analyzing: true,
  preProcess: true,
  onlySuites: [],
  testingDbUrl: 'mongodb://127.0.0.1:3001/meteor_latte'
}

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

  return function describeBlock (label, fn) {
    T.needToBoot && Meteor.startup(T.run)
    T.needToBoot = false
    if (T.preProcess) { return T.describeBlocks.push(describeBlock.bind(this, label, fn)) }
    if (T.deepLevel === 0 && options.runOnly && !excludedSuite(T.onlySuites, label) && !T.onlySuitesAsUserParams) { T.onlySuites.push(label) }
    if (T.deepLevel === 0 && preventsSuiteFromRunning(label)) { return }
    if (T.analyzing && T.deepLevel === 0) {
      var testSuite = describeBlock.bind(this, label, fn)
      T.currentRootDescribeBlock = testSuite
      T.suites.push(testSuite)
    }
    !T.analyzing && T.describeMessages.push(T.message(type, label, T.deepLevel))
    T.deepLevel++
    fn()
    if (T.itBlockRunLevel >= T.deepLevel) {
      T.afterAllBlocks.filter(sameLevel).map(fns).forEach(exec) // only run afterAll blocks for this level
    }
    T.itBlockRunLevel = T.deepLevel
    T.describeMessages = []
    var contextBlocks = ['beforeAll', 'beforeEach', 'afterEach', 'afterAll']
    contextBlocks.forEach(filterFromSameLevel)
    T.deepLevel--
    getCollections().forEach(removeAll)
  }

  function sameLevel (obj) {
    return obj.deepLevel === T.deepLevel
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
  return Object.keys(global).map(toGlobalObject).filter(nonMeteorCollections)

  function toGlobalObject (key) {
    return global[key]
  }

  function nonMeteorCollections (globalObject) {
    return globalObject instanceof Meteor.Collection
  }
}

// Global variables are not attached to the `global` object in Meteor packages, so we ignore style checker for this section.
// Details: http://stackoverflow.com/questions/31526454/global-variables-not-being-attached-to-the-global-object-on-meteorjs-packages

/*eslint-disable */
describe = T.describe.bind(T)
context = T.context.bind(T)
it = T.it.bind(T)
iit = T.iit.bind(T)
beforeAll = T.defineHook('beforeAll').bind(T)
beforeEach = T.defineHook('beforeEach').bind(T)
afterAll = T.defineHook('afterAll').bind(T)
afterEach = T.defineHook('afterEach').bind(T)
ddescribe = T.ddescribe.bind(T)
ccontext = T.ccontext.bind(T)
/*eslint-enable */

