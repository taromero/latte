T = {
  run: function() {
    console.log(T.describeBlocks.length)
    while(T.describeBlocks.length != 0) {
      T.describeBlocks.pop()()
    }
    T.labels.forEach(print)
    T.exceptions.forEach(print)
    process.exit(T.exceptions.length)
  },
  describeBlocks: [],
  describe: function(label, fn) {
    T.queueMsg('describe', label)
    T.describeBlocks.push(fn)
  },
  context: function(label, fn) {
    T.queueMsg('context', label)
    T.describeBlocks.push(fn)
  },
  exceptions: [],
  it: function(label, fn) {
    T.queueMsg('it', label)
    try { fn() } catch(e) { T.exceptions.push(e) }
  },
  labels: [],
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
  }
}

function print(obj) {
  if (obj.prettyPrint) {
    console.log(obj.prettyPrint())
  } else {
    console.log(obj)
  }
}

global.describe = T.describe.bind(T)
global.context = T.context.bind(T)
global.it = T.it.bind(T)

