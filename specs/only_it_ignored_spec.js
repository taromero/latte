itIncludedCounter = 0

T.prepare(function() {
  
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

    it('should not run the `it` block', function() {
      expect(1).to.eq(2)
    })

    it('should run the `it` block with runOnly set to true', function() {
      itIncludedCounter++
      a.should.eq(1)
      b.should.eq(1)
    }, { runOnly: true })

    process.env.ONLY_IT = originalOnlySuite

  })

})

