const chai = require('chai')
global.T = require('@taromero/latte')

chai.should() // initialize Chai's should for assertions
global.expect = chai.expect

Meteor.startup(() => T.test())
