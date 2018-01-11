module.exports = {
  pointToTestingDB () {
    const T = this
    T.getCollections().forEach(function (collection) {
      collection.latteOriginalDatabaseName =
        collection._driver.mongo.db.s.databaseName // keep track of original db name, to point back to development's DB once tests have finished
      collection._driver.mongo.db.s.databaseName = T.testingDbName
    })
  },

  pointBackToDevelopDB (collection) {
    this.getCollections().forEach(function (collection) {
      collection._driver.mongo.db.s.databaseName =
        collection.latteOriginalDatabaseName
    })
  },

  cleanUpDb () {
    this.getCollections().forEach(removeAll)

    function removeAll (collection) {
      collection.remove({})
    }
  },

  getCollections () {
    const globalObject = this.collectionsContainer || global
    return Object.keys(globalObject)
      .map(toGlobalObject)
      .filter(nonMeteorCollections)
      .concat([Meteor.users])

    function toGlobalObject (key) {
      return globalObject[key]
    }

    function nonMeteorCollections (value) {
      return value instanceof Meteor.Collection
    }
  }
}
