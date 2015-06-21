Package.describe({
  name: 'canotto90:latte',
  version: '0.0.3',
  summary: 'Run mocha-like specs in Meteor, without Velocity\'s overhead.',
  git: 'https://github.com/taromero/latte.git',
  documentation: '../../README.md'
})

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.1')
  api.use('mongo@1.1.0', 'server')
  api.use('nooitaf:colors@0.0.2')
  api.addFiles('latte.js', 'server')
  api.export('T', 'server')
  api.export('describe', 'server')
  api.export('context', 'server')
  api.export('it', 'server')
  api.export('beforeAll', 'server')
  api.export('beforeEach', 'server')
  api.export('afterAll', 'server')
  api.export('afterEach', 'server')
})
