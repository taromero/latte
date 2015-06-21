T = {
  suites: [],
  suite: function(testSuite, options) {
    options = options || {}
    runOnly = (options.runOnly === undefined) ? false : options.runOnly
    if (process.env.RUN_TESTS != 'true') { return }
    if (process.env.ONLY_SUITE == 'true' && !runOnly) { return }
    T.suites.push(testSuite)
    if (T.isFirstAddedSuite) { Meteor.startup(T.run) }
    T.isFirstAddedSuite = false
  },
  run: function() {
    if (process.env.RUN_TESTS != 'true') { return }
    var testingDB = new MongoInternals.RemoteCollectionDriver(T.testingDbUrl)
    getCollections().forEach(pointToTestingDB)
    getCollections().forEach(removeAll)

    T.suites.forEach(function(testSuite) {
      testSuite()
    })

    log('')
    log((T.itCount + ' tests: ').yellow + (T.successfulItCount + ' passing, ').green + (T.itCount - T.successfulItCount + ' failing.').red)

    getCollections().forEach(pointBackToDevelopDB)
    T.postRunCallback()

    if (process.env.CONTINUOUS_TESTING != 'true') {
      process.exit(T.exceptions.length)
    }

    function pointToTestingDB(collection) {
      collection.latte_original_driver = collection._driver
      collection._driver = testingDB
      collection._collection = collection._driver.open(collection._name, collection._connection)
    }

    function pointBackToDevelopDB(collection) {
      collection._collection = collection.latte_original_driver.open(collection._name, collection._connection)
    }
  },
  describe: descriptionBlock('describe'),
  context: descriptionBlock('context'),
  it: function(label, fn, options) {
    options = options || {}
    runOnly = (options.runOnly === undefined) ? false : options.runOnly
    msg = T.message('it', label, T.deepLevel)
    if (process.env.ONLY_IT == 'true') {
      if (!runOnly) {
        return
      } else {
        msg = msg.underline
      }
    }

    T.itCount++
    try {
      T.beforeAllBlocks.forEach(exec)
      T.beforeEachBlocks.map(fns).forEach(exec)
      T.beforeAllBlocks = []
      fn()
      itBlocksRunForDescribeBlock = true
      T.afterEachBlocks.map(fns).forEach(exec)
      T.successfulItCount++
      log((msg + ' (/)'.green))
    } catch(e) {
      log(msg + ' (X)'.red)
      log(e.stack)
      T.exceptions.push(e)
    }
  },
  beforeAll: function(fn) {
    T.beforeAllBlocks.push(fn)
  },
  beforeEach: function(fn) {
    T.beforeEachBlocks.push({ fn: fn, deepLevel: T.deepLevel })
  },
  afterAll: function(fn) {
    if (itBlocksRunForDescribeBlock) {
      fn()
    }
  },
  afterEach: function(fn) {
    T.afterEachBlocks.push({ fn: fn, deepLevel: T.deepLevel })
  },
  message: function(type, label, deepLevel) {
    var prefix = _.range(deepLevel).reduce(function(a) { return a + '  '}, '')
    return prefix + type.magenta.bold + ' ' + label.cyan
  },
  postRunCallback: function() {},
  describeBlocks: [],
  exceptions: [],
  deepLevel: 0,
  itCount: 0,
  successfulItCount: 0,
  beforeAllBlocks: [],
  afterAllBlocks: [],
  beforeEachBlocks: [],
  afterEachBlocks: [],
  itBlocksRunForDescribeBlock: false,
  isFirstAddedSuite: true,
  testingDbUrl: "mongodb://127.0.0.1:3001/meteor_latte"
}

function fns(obj) {
  return obj.fn
}

function exec(fn) {
  fn()
}

function removeAll(collection) {
  collection.remove({})
}

function descriptionBlock(type) {
  return function(label, fn) {
    itBlocksRunForDescribeBlock = false
    log(T.message(type, label, T.deepLevel))
    T.deepLevel++
    fn()
    T.beforeEachBlocks.filter(sameLevel)
    T.deepLevel--
    if (T.deepLevel === 0) {
      getCollections().forEach(removeAll)
    }
  }

  function sameLevel(obj) {
    return obj.deepLevel == T.deepLevel
  }
}

function log(obj) {
  console.log(obj)
}

function getCollections() {
  collections = []
  for (var globalObject in global) {
    if (global[globalObject] instanceof Meteor.Collection) {
      collections.push(global[globalObject])
    }
  }
  return collections
}

describe = T.describe.bind(T)
context = T.context.bind(T)
it = T.it.bind(T)
beforeAll = T.beforeAll.bind(T)
beforeEach = T.beforeEach.bind(T)
afterAll = T.afterAll.bind(T)
afterEach = T.afterEach.bind(T)

