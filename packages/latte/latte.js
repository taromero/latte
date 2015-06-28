T = {
  ssuite: function(testSuite, options) {
    options = options || {}
    T.suite(testSuite, _(options).extend({ runOnly: true }))
  },
  suite: function(testSuite, options) {
    options = options || {}
    if (!process.env.RUN_TESTS) { return }
    options.runOnly && T.runOnlySuites.push(testSuite)
    T.suites.push(testSuite)
    T.isFirstAddedSuite && Meteor.startup(function() {
      T.analize()
      T.run()
    })
    T.isFirstAddedSuite = false
  },
  analize: function() {
    T.analizing = true
    T.suites.concat(T.runOnlySuites).forEach(exec)
    T.analizing = false
  },
  run: function() {
    if (!process.env.RUN_TESTS) { return }

    var testingDB = new MongoInternals.RemoteCollectionDriver(T.testingDbUrl)
    getCollections().forEach(pointToTestingDB)
    getCollections().forEach(removeAll)

    if (T.onlyRootDescribeBlocksForIit.length) {
      _(T.onlyRootDescribeBlocksForIit).uniq().forEach(setDeepLevelAndExec)
    } else if (T.onlyRootDescribeBlocks.length) {
      _(T.onlyRootDescribeBlocks).uniq().forEach(setDeepLevelAndExec)
    } else {
      T.runOnlySuites.length ? T.runOnlySuites.forEach(exec) : T.suites.forEach(exec)
    }

    log('\n' + (T.itCount + ' tests: ').yellow + (T.successfulItCount + ' passing, ').green + (T.itCount - T.successfulItCount + ' failing.').red)

    getCollections().forEach(pointBackToDevelopDB)
    T.postRunCallback()

    process.env.RUN_TESTS != 'cont' && process.exit(T.exceptions.length)

    function pointToTestingDB(collection) {
      collection.latte_original_driver = collection._driver
      collection._driver = testingDB
      collection._collection = collection._driver.open(collection._name, collection._connection)
    }

    function pointBackToDevelopDB(collection) {
      collection._collection = collection.latte_original_driver.open(collection._name, collection._connection)
    }

    function setDeepLevelAndExec(obj) {
      T.onlyDescribeDeepLevel = obj.deepLevel
      obj.block()
    }
  },
  ddescribe: descriptionBlock('describe', true),
  ccontext: descriptionBlock('context', true),
  describe: descriptionBlock('describe'),
  context: descriptionBlock('context'),
  iit: function(label, fn, options) {
    if (T.analizing) {
      if (!_(_(T.onlyRootDescribeBlocksForIit).pluck('block')).contains(T.currentRootDescribeBlock)) {
        T.onlyRootDescribeBlocksForIit.push({ block: T.currentRootDescribeBlock, deepLevel: T.deepLevel })
      }
      return
    }
    options = options || {}
    T.it(label, fn, _(options).extend({ runOnly: true }))
  },
  it: function(label, fn, options) {
    if (T.analizing) { return }
    options = options || {}
    msg = T.message('it', label, T.deepLevel)
    if (T.onlyRootDescribeBlocksForIit.length) {
      if (!options.runOnly) { return }
      msg = msg.underline
    } else if (T.onlyRootDescribeBlocks.length) {
      if (T.onlyDescribeDeepLevel >= T.deepLevel) {  return }
      msg = msg.underline
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
    if (T.analizing) { return }
    T.beforeAllBlocks.push(fn)
  },
  beforeEach: function(fn) {
    if (T.analizing) { return }
    T.beforeEachBlocks.push({ fn: fn, deepLevel: T.deepLevel })
  },
  afterAll: function(fn) {
    if (T.analizing) { return }
    if (itBlocksRunForDescribeBlock) { fn() }
  },
  afterEach: function(fn) {
    if (T.analizing) { return }
    T.afterEachBlocks.push({ fn: fn, deepLevel: T.deepLevel })
  },
  message: function(type, label, deepLevel) {
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
  itCount: 0,
  successfulItCount: 0,
  beforeAllBlocks: [],
  afterAllBlocks: [],
  beforeEachBlocks: [],
  afterEachBlocks: [],
  onlyRootDescribeBlocks: [],
  onlyRootDescribeBlocksForIit: [],
  isFirstAddedSuite: true,
  testingDbUrl: "mongodb://127.0.0.1:3001/meteor_latte"
}

function fns(obj) { return obj.fn }

function exec(fn) { fn() }

function removeAll(collection) { collection.remove({}) }

function descriptionBlock(type, onlyBlock) {
  return function(label, fn) {
    return T.analizing ? analizeBlock(label, fn) : describeBlock(label, fn)
  }

  function analizeBlock(label, fn) {
    if (T.deepLevel == 0) { T.currentRootDescribeBlock = describeBlock.bind(this, label, fn) }
    if (onlyBlock) {
      if (!_(_(T.onlyRootDescribeBlocks).pluck('block')).contains(T.currentRootDescribeBlock)) {
        T.onlyRootDescribeBlocks.push({ block: T.currentRootDescribeBlock, deepLevel: T.deepLevel })
      }
    }
    T.deepLevel++
    fn()
    T.deepLevel--
  }

  function describeBlock(label, fn) {
    itBlocksRunForDescribeBlock = false
    log(T.message(type, label, T.deepLevel))
    T.deepLevel++
    fn()
    T.deepLevel--
    T.beforeEachBlocks.filter(sameLevel)
    if (T.deepLevel === 0) {
      getCollections().forEach(removeAll)
    }
  }

  function sameLevel(obj) {
    return obj.deepLevel == T.deepLevel
  }
}

function log(obj) {
  !T.analizing && console.log(obj)
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
iit = T.iit.bind(T)
beforeAll = T.beforeAll.bind(T)
beforeEach = T.beforeEach.bind(T)
afterAll = T.afterAll.bind(T)
afterEach = T.afterEach.bind(T)
ddescribe = T.ddescribe.bind(T)
ccontext = T.ccontext.bind(T)

