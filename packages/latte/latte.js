T = {
  ssuite: function(suiteName, testSuite, options) { // wrapper for `suite` to only run selected suites
    if (suiteName instanceof Function) {
      testSuite = suiteName
      options = testSuite
      suiteName = ''
    }
    options = options || {}
    T.suite(suiteName, testSuite, _(options).extend({ runOnly: true }))
  },
  suite: function(suiteName, testSuite, options) {
    if (suiteName instanceof Function) {
      testSuite = suiteName
      options = testSuite
      suiteName = ''
    }
    options = options || {}
    if (!process.env.RUN_TESTS) { return } // don't run any test related stuff unless explicitly told so

    latte_suites_args = process.env.LATTE_SUITES && JSON.parse(process.env.LATTE_SUITES)
    if (latte_suites_args && latte_suites_args.some(preventsSuiteFromRunning)) { return }

    if (options.runOnly) {
      T.runOnlySuites.push(testSuite) // if `runOnly` is specified (when using `ssuite`), keep track in a separate suite array
    } else {
      T.suites.push(testSuite)
    }
    T.isFirstAddedSuite && Meteor.startup(function() { // upon first suite addition, add a callback to startup to run tests
      T.analize() // look at suites structure and prepare the test run (this allows, for example, iit behavior)
      T.run() // run code defined inside suites (describe blocks)
    })
    T.isFirstAddedSuite = false

    function preventsSuiteFromRunning(latte_suite_arg) {
      if (startsWith(latte_suite_arg, '~')) {
        if (latte_suite_arg.replace('~', '') == suiteName) {
          return true
        }
      } else if (latte_suite_arg != suiteName) {
        return true
      }
    }
  },
  analize: function() { // this lets us analyze suite's structure to act accordingly later (allowing, for example, iit blocks to work)
    T.analyzing = true
    T.suites.concat(T.runOnlySuites).forEach(exec)
    T.analyzing = false
  },
  run: function() {
    if (!process.env.RUN_TESTS) { return }

    var testingDB = new MongoInternals.RemoteCollectionDriver(T.testingDbUrl) // create a driver pointing to testing's DB
    getCollections().forEach(pointToTestingDB) // point collections to testing's DB
    getCollections().forEach(removeAll) // erase date on testing DB (though there should be none)

    if (T.onlyRootDescribeBlocksForIit.length) { // if there's `iit` blocks, only run those
      T.onlyRootDescribeBlocksForIit.forEach(exec)
    } else { // else, run all blocks
      T.runOnlySuites.length ? T.runOnlySuites.forEach(exec) : T.suites.forEach(exec) // if there are `runOnlySuites` only run those
    }

    // output number of successful over total tests
    log('\n' + (T.itCount + ' tests: ').yellow + (T.successfulItCount + ' passing, ').green + (T.itCount - T.successfulItCount + ' failing.').red)

    getCollections().forEach(pointBackToDevelopDB) // point collections back to development's DB
    T.postRunCallback() // allow to run a callback when testing has finished (before possibly ending the process)

    process.env.RUN_TESTS != 'cont' && process.exit(T.exceptions.length) // end the process unless option is specified

    function pointToTestingDB(collection) {
      collection.latte_original_driver = collection._driver // keep track of original driver, to point back to development's DB once tests have finished
      collection._driver = testingDB
      collection._collection = collection._driver.open(collection._name, collection._connection)
    }

    function pointBackToDevelopDB(collection) {
      collection._collection = collection.latte_original_driver.open(collection._name, collection._connection)
    }
  },
  describe: descriptionBlock('describe'),
  context: descriptionBlock('context'),
  iit: function(label, fn, options) {
    if (T.analyzing) {
      if (!_(T.onlyRootDescribeBlocksForIit).contains(T.currentRootDescribeBlock)) { // only if we have not already added the root describe
        // keeping track of the root describe allow as to run all before/after hooks from the beginning.
        // This also allow to print all labels from the beginning
        T.onlyRootDescribeBlocksForIit.push(T.currentRootDescribeBlock)
      }
    }
    options = options || {}
    T.it(label, fn, _(options).extend({ runOnly: true }))
  },
  it: function(label, fn, options) {
    if (T.analyzing) { return } // don't run `it` blocks when analyzing
    options = options || {}
    msg = T.message('it', label, T.deepLevel) // generate msg for reports

    if (T.onlyRootDescribeBlocksForIit.length) { // if there's any `iit` block
      if (!options.runOnly) { return } // only run `iit` blocks
      msg = msg.underline
    }

    while(T.describeMessages.length) { // only print `describe` labels if their nested `it` blocks get executed
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
      log((msg + ' (/)'.green))                 // log into stdout tests label and result
    } catch(e) {
      log(msg + ' (X)'.red)
      log(e.stack)
      T.exceptions.push(e)                      // if `T.exceptions` has any item at the en of the test run, exit code will be != 0
    }
  },
  beforeAll: function(fn) {
    if (T.analyzing) { return }
    T.beforeAllBlocks.push({ fn: fn, deepLevel: T.deepLevel })  // keep track of beforeAll blocks, to run them later
  },
  beforeEach: function(fn) {
    if (T.analyzing) { return }
    T.beforeEachBlocks.push({ fn: fn, deepLevel: T.deepLevel })
  },
  afterAll: function(fn) {
    if (T.analyzing) { return }
    T.afterAllBlocks.push({ fn: fn, deepLevel: T.deepLevel })
  },
  afterEach: function(fn) {
    if (T.analyzing) { return }
    T.afterEachBlocks.push({ fn: fn, deepLevel: T.deepLevel })
  },
  message: function(type, label, deepLevel) { // pretty print messages for console report
    var prefix = _.range(deepLevel).reduce(function(a) { return a + '  '}, '')
    return prefix + type.magenta.bold + ' ' + label.cyan
  },
  ignore: function() {},
  suites: [],
  runOnlySuites: [],
  postRunCallback: function() {},
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
  isFirstAddedSuite: true,
  testingDbUrl: "mongodb://127.0.0.1:3001/meteor_latte"
}

function fns(obj) { return obj.fn }

function exec(fn) { fn() }

function removeAll(collection) { collection.remove({}) }

function descriptionBlock(type) {
  return function(label, fn) {
    return T.analyzing ? analizeBlock(label, fn) : describeBlock(label, fn)
  }

  function analizeBlock(label, fn) {
    if (T.deepLevel == 0) { T.currentRootDescribeBlock = describeBlock.bind(this, label, fn) }
    T.deepLevel++
    fn()
    T.deepLevel--
  }

  function describeBlock(label, fn) {
    T.describeMessages.push(T.message(type, label, T.deepLevel))
    T.deepLevel++
    fn()
    if (T.itBlockRunLevel >= T.deepLevel) {
      T.afterAllBlocks.filter(sameLevel).map(fns).forEach(exec) // only run afterAll blocks for this level
    }
    T.itBlockRunLevel = T.deepLevel
    T.describeMessages = []
    contextBlocks = ['beforeAll', 'beforeEach', 'afterEach', 'afterAll']
    contextBlocks.forEach(filterFromSameLevel)
    T.deepLevel--
    getCollections().forEach(removeAll)
  }

  function sameLevel(obj) {
    return obj.deepLevel == T.deepLevel
  }

  function filterFromSameLevel(blockName) {
    T[blockName + 'Blocks'] = T[blockName + 'Blocks'].filter(differentLevel)

    function differentLevel(obj) {
      return obj.deepLevel != T.deepLevel
    }
  }

}

function log(obj) {
  !T.analyzing && console.log(obj) // prevent logging while analyzing the suites
}

function startsWith(str, needle) {
  return str.indexOf(needle) == 0
}

function getCollections() {
  return Object.keys(global).map(toGlobalObject).filter(nonMeteorCollections)

  function toGlobalObject(key) {
    return global[key]
  }

  function nonMeteorCollections(globalObject) {
    return globalObject instanceof Meteor.Collection
  }
}

describe = T.describe.bind(T)
context = T.context.bind(T)
it = T.it.bind(T)
iit = T.iit.bind(T)
beforeAll = T.beforeAll.bind(T)
beforeEach = T.beforeEach.bind(T)
afterAll = T.afterAll.bind(T)
afterEach = T.afterEach.bind(T)

