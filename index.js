// Prevent processing this file, unless we are in testing mode.
// While initially tried to implement this through Meteor.isTest,
// I found it a bit tricky.
const allowedModes = ['run', 'watch']

if (
  process.env.NODE_ENV === 'test' &&
  allowedModes.includes(process.env.LATTE_MODE)
) {
  module.exports = require('./lib/latte')
}
