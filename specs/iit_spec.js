T.suite(function() {

  itIncludedCounter = 0
  
  describe('running selected `it` blocks using ONLY_IT', function() {

    var originalOnlySuite = process.env.ONLY_IT
    process.env.ONLY_IT = 'true'

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

    it('should not run the `it` block'.red, function() {
      expect(1).to.eq(2)
    })

    iit('should run the `iit` block', function() {
      itIncludedCounter++
      a.should.eq(1)
      b.should.eq(1)
    })

    process.env.ONLY_IT = originalOnlySuite

  })

})

