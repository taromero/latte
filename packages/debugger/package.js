Package.describe({
  name: 'canotto90:debugger',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
})

Npm.depends({
  inquirer: '0.9.0'
})

Package.onUse(function (api) {
  api.addFiles('debugger.js')
  api.export('inquirer', 'server')
  api.export('readline', 'server')
  api.export('debug', 'server')
})

