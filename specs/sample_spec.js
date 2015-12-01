global.Subjects = new Mongo.Collection('subjects')

describe('Subject seeding', function () {

  context('there aren\'t any subjects in the DB', function () {

    beforeEach(function () {
      Seed.subjects()
    })

    it('should create new subjects', function () {
      Subjects.find().count().should.be.gt(1)
    })

  })

  context('there are already existing subjects in the DB', function () {

    beforeEach(function () {
      Subjects.insert({})
      Seed.subjects()
    })

    it('should not create new subjects', function () {
      Subjects.find().count().should.eq(2)
    })

  })

})

var Seed = {
  subjects: function () {
    if (!Subjects.find().count()) {
      Subjects.insert({ name: 'name1'})
      Subjects.insert({ name: 'name2'})
      Subjects.insert({ name: 'name3'})
    }
  }
}
