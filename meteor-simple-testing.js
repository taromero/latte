Exams = new Mongo.Collection('exams')
Subjects = new Mongo.Collection('subjects')

if (Meteor.isServer) {
  T.prepare(function() {
    should()

    describe('model example', function() {

      beforeAll(function() {
        Exams.insert({ score: 9 })
      })

      beforeEach(function() {
        Subjects.insert({ name: 'name' })
      })

      it('should have 1 exams', function() {
        Exams.find().count().should.eq(1)
      })

      it('should have 2 subjects', function() {
        Subjects.find().count().should.eq(2)
      })

      afterAll(function() {
        Exams.insert({ score: 8 })
      })

      context('inserting a new record in an afterAll block', function() {

        it('should have 2 exams', function() {
          Exams.find().count().should.eq(2)
        })

      })

    })

    describe('simple math example', function() {

      context('1 + 1', function() {

        var number

        beforeAll(function() {
          number = 1 + 1
        })

        it('should be 2', function() {
          number.should.equal(2)
        })

        it('should be greater than 1', function() {
          number.should.be.above(1)
        })

        context('multiplied by 2', function() {

          beforeAll(function() {
            number = number * 2
          })

          it('should be 4', function() {
            number.should.equal(4)
          })

        })

      })

    })
  })

  Meteor.startup(function() {
    T.run(function() {
      if (suiteIncludedCounter != 3) {
        throw 'ignored suite tests that should not have been ignored'
      }
    })

  })

}
