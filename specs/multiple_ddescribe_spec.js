var ddescribeCounter1 = 0
var ddescribeCounter2 = 0

ddescribe('first ddescribe', function() {

  it('should run assertions', function() {
    'a'.should.eq('a')
    ddescribeCounter1++
  })

  T.postRunCallback = function() {
    if (ddescribeCounter1 != 1) { throw 'some assertion failed to exec. ddescribeCounter = ' + ddescribeCounter }
  }

})

ddescribe('second ddescribe', function() {

  it('should run assertions', function() {
    'a'.should.eq('a')
    ddescribeCounter2++
  })

  T.postRunCallback = function() {
    if (ddescribeCounter2 != 1) { throw 'some assertion failed to exec. ddescribeCounter = ' + ddescribeCounter }
  }

})

