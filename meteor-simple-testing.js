Exams = new Mongo.Collection('exams')

if (Meteor.isServer) {
  Meteor.startup(function () {

    should()

    describe('model example', function() {

      Exams.insert({ score: 9 })

      it('should have 1 exams', function() {
        Exams.find().count().should.eq(1)
      })

    })

    describe('simple math example', function() {

      context('1 + 1', function() {

        number = 1 + 1

        it('should be 3 (expected failure)', function() {
          number.should.equal(3)
        })

        it('should be greater than 1', function() {
          number.should.be.above(1)
        })

        context('multiplied by 2', function() {

          number = number * 2

          it('should be 4', function() {
            number.should.equal(4)
          })
        })

      })

    })

    Meteor.setTimeout(function() {
      T.run()
    })

  })
}
