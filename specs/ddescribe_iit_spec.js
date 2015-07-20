var ddescribeCounter = 0

ddescribe('ddescribe should take precedence over iit blocks', function () {

  context('`iit` block declared outside of `ddescribe`', function () {

    it('should run assertions', function () {
      'a'.should.eq('a')
      ddescribeCounter++
    })

  })

})

describe('describe block containing an iit block, in presence of a ddescribe block', function () {

  iit('should not run the `iit` assertion', function () {
    'a'.should.eq('b')
  })

})

T.postRunCallbacks.push({
  label: 'ddescribe should take precedence over iit blocks',
  fn: function () {
    if (ddescribeCounter !== 1) { throw 'ddescribe_iit_spec: some assertion failed to exec. ddescribeCounter = ' + ddescribeCounter }
  }
})

