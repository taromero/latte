T = {
  run: function() {
    getCollections().forEach(removeAll)
    while(T.describeBlocks.length !== 0) {
      T.describeBlocks.pop()()
      getCollections().forEach(removeAll)
    }
    T.labels.forEach(print)
    T.exceptions.forEach(print)
    process.exit(T.exceptions.length)

    function removeAll(collection) {
      collection.remove({})
    }
  },
  describe: function(label, fn) {
    T.queueMsg('describe', label)
    T.describeBlocks.push(fn)
  },
  context: function(label, fn) {
    T.queueMsg('context', label)
    T.describeBlocks.push(fn)
  },
  it: function(label, fn) {
    T.queueMsg('it', label)
    try { fn() } catch(e) { T.exceptions.push(e) }
  },
  queueMsg: function(type, label) {
    T.labels.push({
      type: type,
      label: label,
      prettyPrint: function() {
        if (this.type == 'it') {
          return '  ' + this.type + ' ' + this.label
        } else {
          return this.type + ' ' + this.label
        }
      }
    })
  },
  describeBlocks: [],
  exceptions: [],
  labels: []
}

function print(obj) {
  if (obj.prettyPrint) {
    console.log(obj.prettyPrint())
  } else {
    console.log(obj)
  }
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

