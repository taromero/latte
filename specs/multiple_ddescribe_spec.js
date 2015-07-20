var ddescribeCounter1 = 0
var ddescribeCounter2 = 0

ddescribe('first ddescribe', function () {

  it('should run assertions', function () {
    'a'.should.eq('a')
    ddescribeCounter1++
  })

})

ddescribe('second ddescribe', function () {

  it('should run assertions', function () {
    'a'.should.eq('a')
    ddescribeCounter2++
  })

})

T.postRunCallbacks.push({
  label: 'first ddescribe',
  fn: function () {
    if (ddescribeCounter1 !== 1) { throw 'multiple_ddescribe_spec: some assertion failed to exec. ddescribeCounter = ' + ddescribeCounter1 }
  }
})

T.postRunCallbacks.push({
  label: 'second ddescribe',
  fn: function () {
    if (ddescribeCounter2 !== 1) { throw 'multiple_ddescribe_spec: some assertion failed to exec. ddescribeCounter = ' + ddescribeCounter2 }
  }
})

