global.SampleCollection = new Mongo.Collection('sample_collections')
SampleCollection.remove({})
SampleCollection.insert({})

SampleCollection.find()
  .count()
  .should.eq(1)

describe('latte should use a separate DB from develop', function () {
  it("should not see the entity created on develop's DB", function () {
    const count = SampleCollection.find().count()
    count.should.eq(0)
  })

  context('creating a new entity', function () {
    beforeEach(function () {
      SampleCollection.insert({ env: 'test' })
    })

    it("should see the entity created on test's DB", function () {
      const count = SampleCollection.find().count()
      count.should.eq(1)
    })
  })
})
