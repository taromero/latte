const Chalk = require('chalk').constructor

// We need to set this values for Chalk to be enabled within Meteor apps.
const chalk = new Chalk({ enabled: true, level: 2 })

module.exports = chalk
