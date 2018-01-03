var iitCounter = 0
var eachCounter = 0

describe('iit behaviour', function () {
  context('an `iit` block is defined in some `describe` block', function () {
    describe('describe block containing `iit` block in a nested level', function () {
      beforeEach(() => eachCounter++)
      afterEach(() => eachCounter++)

      it('should not run `it` assertions', function () {
        throw new Error(
          'it should not run `it` blocks when an `iit` block is defined'
        )
      })

      iit('should run multiple `iit` assertions', function () {
        iitCounter++
      })

      describe('nested describe block not containing any `iit` block, not directly nor nested, on same level as an `iit` containing describe block', function () {
        beforeEach(() => eachCounter++)
        afterEach(() => eachCounter++)

        it('should not run `it` nor before/after blocks', function () {
          throw new Error(
            'it should not run `it` blocks when an `iit` block is defined'
          )
        })
      })

      describe('nested describe block containing `iit` block', function () {
        beforeEach(() => eachCounter++)
        afterEach(() => eachCounter++)

        iit('should run `iit` assertions', function () {
          iitCounter++
        })

        iit(
          'should run multiple `iit` assertions on the same `describe` level',
          function () {
            iitCounter++
          }
        )

        describe('nested describe block without `iit`', function () {
          beforeEach(() => eachCounter++)
          afterEach(() => eachCounter++)

          it('should not run `it`', function () {
            throw new Error(
              'it should not run `it` blocks when an `iit` block is defined'
            )
          })
        })
      })
    })
  })
})

T.postRunCallbacks.push({
  label: 'iit behaviour',
  fn: function () {
    if (iitCounter !== 3) {
      throw new Error(
        'some assertion failed to exec. iitCounter == ' + iitCounter
      )
    }
    if (eachCounter !== 10) {
      throw new Error(
        'some before/afterEach block failed to exec. eachCounter == ' +
          eachCounter
      )
    }
  }
})
