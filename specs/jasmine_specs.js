// Limited set of jasmine generic specs (from http://jasmine.github.io/2.3/introduction.html)
describe('jasmine limited suite', function () {
  // Introduction

  describe('A suite', function () {
    it('contains spec with an expectation', function () {
      true.should.be.true
    })
  })

  describe('A suite is just a function', function () {
    var a

    it('and so is a spec', function () {
      a = true

      a.should.be.true
    })
  })

  // Grouping Related Specs with describe

  describe('A spec', function () {
    it('is just a function, so it can contain any code', function () {
      var foo = 0
      foo += 1

      expect(foo).to.eq(1)
    })

    it('can have more than one expectation', function () {
      var foo = 0
      foo += 1

      expect(foo).to.eq(1)
      expect(true).to.eq(true)
    })
  })

  // Setup and Teardown

  describe('A spec using beforeEach and afterEach', function () {
    var foo = 0

    beforeEach(function () {
      foo += 1
    })

    afterEach(function () {
      foo = 0
    })

    it('is just a function, so it can contain any code', function () {
      expect(foo).to.eq(1)
    })

    it('can have more than one expectation', function () {
      expect(foo).to.eq(1)
      expect(true).to.eq(true)
    })
  })

  describe('A spec using beforeAll and afterAll', function () {
    var foo

    beforeAll(function () {
      foo = 1
    })

    afterAll(function () {
      foo = 0
    })

    it('sets the initial value of foo before specs run', function () {
      expect(foo).to.eq(1)
      foo += 1
    })

    it('does not reset foo between specs', function () {
      expect(foo).to.eq(2)
    })
  })

  // Nesting describe Blocks

  describe('A spec', function () {
    var foo

    beforeEach(function () {
      foo = 0
      foo += 1
    })

    afterEach(function () {
      foo = 0
    })

    it('is just a function, so it can contain any code', function () {
      expect(foo).to.eq(1)
    })

    it('can have more than one expectation', function () {
      expect(foo).to.eq(1)
      expect(true).to.eq(true)
    })

    describe('nested inside a second describe', function () {
      var bar

      beforeEach(function () {
        bar = 1
      })

      it('can reference both scopes as needed', function () {
        expect(foo).to.eq(bar)
      })
    })
  })
})
