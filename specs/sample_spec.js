global.Subjects = new Mongo.Collection('subjects')

describe('Subject seeding', function () {

  context('there aren\'t any subjects in the DB', function () {

    beforeEach(function () {
      Seed.subjects()
    })

    it('should create new subjects', function () {
      var a = 1
      // var rl = readline.createInterface({
      //   input: process.stdin,
      //   output: process.stdout
      // });
      // // _question = Meteor.wrapAsync(rl.question, rl)
      // // var a = _question('test question')
      // // rl.close()
      // // console.log(a)
      //
      // rl.question("What do you think of node.js? ", function(answer) {
      //   // TODO: Log the answer in a database
      //   console.log("Thank you for your valuable feedback:", answer);
      //
      //   rl.close();
      // });
      eval(debug)
      Subjects.find().count().should.be.gt(1)
    })

  })

  context('there are already existing subjects in the DB', function () {

    beforeEach(function () {
      Subjects.insert({})
      Seed.subjects()
    })

    it('should not create new subjects', function () {
      debugger
      Subjects.find().count().should.eq(1)
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
