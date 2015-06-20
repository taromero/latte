T = {
  suites: [],
  prepare: function(testSuite) {
    if (process.env.METEOR_ENV != 'test') { return }
    T.suites.push(testSuite)
  },
  run: function() {
    if (process.env.METEOR_ENV != 'test') { return }
    var testingDB = new MongoInternals.RemoteCollectionDriver(T.testingDbUrl)
    getCollections().forEach(pointToTestingDB)
    getCollections().forEach(removeAll)

    T.suites.forEach(function(testSuite) {
      testSuite()
    })

    if (process.env.CONTINUOUS_TESTING != 'true') {
      process.exit(T.exceptions.length)
    }

    function pointToTestingDB(collection) {
      collection._driver = testingDB
      collection._collection = collection._driver.open(collection._name, collection._connection)
    }
  },
  describe: descriptionBlock('describe'),
  context: descriptionBlock('context'),
  it: function(label, fn) {
    print(T.message('it', label, T.deepLevel))
    try { fn() } catch(e) {
      print(e.stack)
      T.exceptions.push(e)
    }
  },
  message: function(type, label, deepLevel) {
    return {
      type: type,
      label: label,
      deepLevel: deepLevel,
      prettyPrint: function() {
        var prefix = _.range(deepLevel).reduce(function(a) { return a + '  '}, '')
        return prefix + this.type.magenta.bold + ' ' + this.label.cyan
      }
    }
  },
  describeBlocks: [],
  exceptions: [],
  deepLevel: 0,
  testingDbUrl: "mongodb://127.0.0.1:3001/meteor_latte"
}

function removeAll(collection) {
  collection.remove({})
}

function descriptionBlock(type) {
  return function(label, fn) {
    print(T.message(type, label, T.deepLevel))
    T.deepLevel += 1
    fn()
    T.deepLevel -= 1
    if (T.deepLevel == 0) {
      getCollections().forEach(removeAll)
    }
  }
}

function print(obj) {
  console.log(obj.prettyPrint ? obj.prettyPrint() : obj)
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

global.describe = T.describe.bind(T)
global.context = T.context.bind(T)
global.it = T.it.bind(T)

