var ddescribeCounter = 0

ddescribe('ddescribe should take precedence over iit blocks', function() {

  context('`iit` block declared outside of `ddescribe`', function() {

    it('should run assertions', function() {
      'a'.should.eq('a')
      ddescribeCounter++
    })

  })

  T.postRunCallback = function() {
    if (ddescribeCounter != 1) { throw 'some assertion failed to exec. ddescribeCounter = ' + ddescribeCounter }
  }

})

describe('describe block containing an iit block, in presence of a ddescribe block', function() {

  iit('should not run the `iit` assertion', function() {
    'a'.should.eq('b')
  })

})
