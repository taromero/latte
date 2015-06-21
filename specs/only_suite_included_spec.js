var originalOnlySuite = process.env.ONLY_SUITE
process.env.ONLY_SUITE = 'true'

suiteIncludedCounter = 1

T.prepare(function() {
  
  describe('running selected `prepare` blocks using ONLY_SUITE', function() {

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

    it('should run even with runOnly set to true for the `it`', function() {
      suiteIncludedCounter++
      a.should.eq(1)
      b.should.eq(1)
    })

  })

}, { runOnly: true })

process.env.ONLY_SUITE = originalOnlySuite
