var ddescribeCounter = 0

ddescribe('if there is a ddescribe block', function() {

  it('should run assertions', function() {
    ddescribeCounter++
  })

  describe('on nested blocks', function() {

    it('should run assertions too', function() {
      ddescribeCounter++
    })

  })

  T.postRunCallback = function() {
    if (ddescribeCounter != 2) { throw 'some assertion failed to exec. ddescribeCounter == ' + ddescribeCounter }
  }

})

describe('unnested describe blocks in presence of a ddescribe block', function() {

  it('should not run assertions', function() {
    'a'.should.eq('b')
  })

  describe('on nested blocks', function() {

    it('should not run assertions either', function() {
      'a'.should.eq('b')
    })

  })

})