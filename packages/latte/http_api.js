HTTP.methods({
  '/test': {
    get: function () {
      T.needToBoot = false
      T.run(this.query.suite)
    }
  }
})

