Package.describe({
  name: 'canotto90:latte',
  version: '0.7.2',
  summary: 'Run mocha-like specs in Meteor, without Velocity\'s overhead.',
  git: 'https://github.com/taromero/latte.git',
  documentation: '../../README.md'
})

Npm.depends({
  figures: '1.3.5'
})

Package.onUse(function (api) {
  api.use('mongo@1.1.0', 'server')
  api.use('nooitaf:colors@0.0.2')
  api.use('accounts-base@1.2.0')
  api.addFiles('latte.js', 'server')
  api.export('T', 'server')
  api.export('describe', 'server')
  api.export('context', 'server')
  api.export('it', 'server')
  api.export('iit', 'server')
  api.export('beforeAll', 'server')
  api.export('beforeEach', 'server')
  api.export('afterAll', 'server')
  api.export('afterEach', 'server')
  api.export('ddescribe', 'server')
  api.export('ccontext', 'server')
})
