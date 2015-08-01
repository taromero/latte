Meteor.methods({
  test: function (input) {
    T.needToBoot = false
    T.run(input)
  }
})

