global.DBCleanupCollection = new Mongo.Collection('db_cleanups_collection')

describe('database cleanup between describe blocks', function () {
  describe('should not see data modifications on the same level', function () {
    describe('describe at level X', function () {
      createOnHooks()

      it('should not see data modified on the same level', function () {
        const count = DBCleanupCollection.find().count()
        count.should.eq(1)
      })
    })

    describe('describe at same level X', function () {
      createOnHooks()

      it('should not see data modified on the same level', function () {
        const count = DBCleanupCollection.find().count()
        count.should.eq(1)
      })
    })
  })

  describe('should see data modifications on previous levels', function () {
    describe('describe block on level X', function () {
      createOnHooks()

      it('should see only date created on level X', function () {
        const count = DBCleanupCollection.find().count()
        count.should.eq(1)
      })

      describe('describe block on level X+1', function () {
        createOnHooks()

        it('should see data created on levels X and X+1', function () {
          const count = DBCleanupCollection.find().count()
          count.should.eq(2)
        })

        it('should see the same data on duplicated "it"s', function () {
          const count = DBCleanupCollection.find().count()
          count.should.eq(2)
        })
      })
    })
  })

  describe('should see data modifications on previous levels even with no `it`s in some levels', function () {
    describe('describe block on level X with no `it` blocks', function () {
      createOnHooks()

      describe('describe block on level X+1', function () {
        createOnHooks()

        it('should see data created on levels X and X+1', function () {
          // because the after blocks have not run on level X, they will run after `it` blocks on level X+1
          const count = DBCleanupCollection.find().count()
          count.should.eq(2)
        })
      })
    })
  })

  context('it assertion throws an exception', function () {
    it('creates an entity and throws an exception', function () {
      DBCleanupCollection.insert({})
      throw new Error(
        "It's ok  to display this error, it's part of a test -12344321-"
      )
    })

    it('should have deleted the entity', function () {
      const count = DBCleanupCollection.find().count()
      count.should.eq(0)
    })
  })
})

function createOnHooks () {
  beforeEach(create)
  afterEach(create)
}
function create () {
  DBCleanupCollection.insert({})
}
