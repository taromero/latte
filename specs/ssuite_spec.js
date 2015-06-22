T.ignore(function() {

  suiteIncludedCounter = 0

  T.ssuite(function() {
    
    describe('running selected `ssuite`', function() {

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

  T.suite(function() {

    throw 'suite should not run with ONLY_SUITE set to true'
    
    describe('this should not run'.red, function() {

      beforeAll(function() {
        throw 'should not run beforeAll'
      })

      beforeEach(function() {
        throw 'should not run beforeEach'
      })

      afterAll(function() {
        throw 'should not run afterAll'
      })

      afterEach(function() {
        throw 'should not run afterEach'
      })

      it('should not run the `it` block', function() {
        expect(1).to.eq(2)
      })

      it('should not run even with runOnly set to true for the `it`', function() {
        expect(1).to.eq(2)
      })

    })

  })

})
