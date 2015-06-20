T = {
  run: function() {
    getCollections().forEach(removeAll)
    while(T.describeBlocks.length !== 0) {
      describeBlock = T.describeBlocks.pop()
      T.deepLevel = describeBlock.msg.deepLevel + 1
      print(describeBlock.msg)
      describeBlock.fn()
      getCollections().forEach(removeAll)
    }
    T.exceptions.forEach(print)
    process.exit(T.exceptions.length)

    function removeAll(collection) {
      collection.remove({})
    }
  },
  describe: descriptionBlock('describe'),
  context: descriptionBlock('context'),
  it: function(label, fn) {
    print(T.message('it', label, T.deepLevel))
    try { fn() } catch(e) { T.exceptions.push(e) }
  },
  message: function(type, label, deepLevel) {
    return {
      type: type,
      label: label,
      deepLevel: deepLevel,
      prettyPrint: function() {
        var prefix = ''
        for(var i = 0; i < deepLevel; i++) {
          prefix += '  '
        }
        return prefix + this.type + ' ' + this.label
      }
    }
  },
  describeBlocks: [],
  exceptions: [],
  deepLevel: 0
}

function descriptionBlock(type) {
  return function(label, fn) {
    T.describeBlocks.push({ fn: fn, msg: T.message(type, label, T.deepLevel) })
  }
}

function print(obj) {
  if (obj.prettyPrint) {
    console.log(obj.prettyPrint())
  }
  if (obj.stack) {
    console.log(obj.stack)
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

