var originalOnlySuite = process.env.ONLY_SUITE
process.env.ONLY_SUITE = 'true'

T.prepare(function() {
  
  describe('this should not run', function() {

    beforeAll(function() {
      throw 'should not run beforeAll'
    })

    beforeEach(function() {
      throw 'should not run beforeEach'
    })

    it('should not run the `it` block', function() {
      expect(1).to.eq(2)
    })

    it('should not run even with runOnly set to true for the `it`', function() {
      expect(1).to.eq(2)
    })

    afterAll(function() {
      throw 'should not run afterAll'
    })

    afterEach(function() {
      throw 'should not run afterEach'
    })

  })

})

process.env.ONLY_SUITE = originalOnlySuite