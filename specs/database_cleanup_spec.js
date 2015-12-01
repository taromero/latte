global.DBCleanupCollection = new Mongo.Collection('db_cleanups_collection')

describe('database cleanup between describe blocks', function () {
  describe('should not see data modifications on the same level', function () {
    describe('describe at level X', function () {
      createOnHooks()

      it('should not see data modified on the same level', function () {
        DBCleanupCollection.find().count().should.eq(2)
      })
    })

    describe('describe at same level X', function () {
      createOnHooks()

      it('should not see data modified on the same level', function () {
        DBCleanupCollection.find().count().should.eq(2)
      })
    })
  })

  describe('should see data modifications on previous levels', function () {
    describe('describe block on level X', function () {
      createOnHooks()

      it('should see only date created on level X', function () {
        DBCleanupCollection.find().count().should.eq(2)
      })

      describe('describe block on level X+1', function () {
        createOnHooks()

        it('should see data created on levels X and X+1', function () {
          DBCleanupCollection.find().count().should.eq(6)
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
          DBCleanupCollection.find().count().should.eq(4)
        })
      })
    })
  })
})

function createOnHooks () {
  beforeEach(create)
  beforeAll(create)
  afterEach(create)
  afterAll(create)
}
function create () {
  DBCleanupCollection.insert({})
}

