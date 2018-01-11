let ddescribeCounter1 = 0
let ddescribeCounter2 = 0

ddescribe('first ddescribe', function () {
  it('should run assertions', function () {
    ddescribeCounter1++
  })
})

ddescribe('second ddescribe', function () {
  it('should run assertions', function () {
    ddescribeCounter2++
  })
})

T.postRunCallbacks.push({
  label: 'first ddescribe',
  fn: function () {
    if (ddescribeCounter1 !== 1) {
      throw new Error(
        'some assertion failed to exec. ddescribeCounter = ' + ddescribeCounter1
      )
    }
  }
})

T.postRunCallbacks.push({
  label: 'second ddescribe',
  fn: function () {
    if (ddescribeCounter2 !== 1) {
      throw new Error(
        'some assertion failed to exec. ddescribeCounter = ' + ddescribeCounter2
      )
    }
  }
})
