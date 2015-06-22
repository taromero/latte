var originalOnlySuite = process.env.ONLY_SUITE
process.env.ONLY_SUITE = 'true'

suiteIncludedCounter = 0

T.ssuite(function() {
  
  describe('running selected `suite` blocks using ONLY_SUITE', function() {

    var a = 0
    var b = 0

    beforeAll(function() {
      a++
    })

    beforeEach(function() {
      b++
    })

    afterAll(function() {
      a--
    })

    afterEach(function() {
      b--
    })

    it('should run the `it` block', function() {
      suiteIncludedCounter++
      a.should.eq(1)
      b.should.eq(1)
    })

    iit('should run even the `iit`', function() {
      suiteIncludedCounter++
      a.should.eq(1)
      b.should.eq(1)
    })

  })

})

process.env.ONLY_SUITE = originalOnlySuite
