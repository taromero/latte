const chai = require('chai')
global.T = require('latte')

chai.should() // initialize Chai's should for assertions
global.expect = chai.expect

Meteor.startup(() => T.test())
