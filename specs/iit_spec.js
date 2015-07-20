var iitCounter = 0
var allCounter = 0
var eachCounter = 0

describe('iit behaviour', function () {

  context('an `iit` block is defined in some `describe` block', function () {

    describe('describe block containing `iit` block in a nested level', function () {

      beforeAll(function () { allCounter++ })
      beforeEach(function () { eachCounter++ })
      afterEach(function () { eachCounter++ })
      afterAll(function () { allCounter++ })

      it('should not run `it` assertions', function () {
        throw new Error('it should not run `it` blocks when an `iit` block is defined')
      })

      iit('should run multiple `iit` assertions', function () {
        iitCounter++
      })

      describe('nested describe block not containing any `iit` block, not directly nor nested, on same level as an `iit` containing describe block', function () {

        beforeAll(function () { allCounter++ })
        afterAll(function () { allCounter++ })

        it('should not run `it` nor before/after blocks', function () {
          throw new Error('it should not run `it` blocks when an `iit` block is defined')
        })

      })

      describe('nested describe block containing `iit` block', function () {

        beforeAll(function () { allCounter++ })
        afterAll(function () { allCounter++ })

        iit('should run `iit` assertions', function () {
          iitCounter++
        })

        iit('should run multiple `iit` assertions on the same `describe` level', function () {
          iitCounter++
        })

        describe('nested describe block without `iit`', function () {

          beforeAll(function () { allCounter++ })
          afterAll(function () { allCounter++ })

          it('should not run `it`', function () {
            throw new Error('it should not run `it` blocks when an `iit` block is defined')
          })
        })

      })

    })

  })

})

T.postRunCallbacks.push({
  label: 'iit behaviour',
  fn: function () {
    if (iitCounter !== 3) { throw 'iit_spec: some assertion failed to exec. iitCounter == ' + iitCounter }
    if (allCounter !== 4) { throw 'iit_spec: some before/afterAll block failed to exec. allCounter == ' + allCounter }
    if (eachCounter !== 6) { throw 'iit_spec: some before/afterEach block failed to exec. eachCounter == ' + eachCounter }
  }
})

