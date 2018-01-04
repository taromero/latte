## Latte

[![Build Status](https://travis-ci.org/taromero/latte.svg?branch=master)](https://travis-ci.org/taromero/latte)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

![](https://raw.githubusercontent.com/taromero/latte/master/sample-spec.png)

#### What

Testing framework to run mocha-esque specs on Meteor apps., without the need of using Velocity.

#### Motivation

The aim of this project is to provide a minimal library to just run specs mocha-style, upon running a command.

#### How to use

1. `npm install latte`.
2. `npm install chai`. Latte needs an assertion library, and I've been using ChaiJS.
3. Write a spec anywhere in a server directory. You'll need an assertion library like `chai` or the `assert` module.
4. Somewhere in the code (before loading the test files):
```javascript
  const latte = require('latte')
  Meteor.startup(() => latte.test())
```
5. On the command line, run: `NODE_ENV=test LATTE_MODE=run meteor --once`.

For examples, check `sample-app/`.

#### Workflow

###### Development (watch-mode)

1. Run `NODE_ENV=test LATTE_MODE=watch meteor`.
2. Write your specs. You'll likely want to use `ddescribe` to only run that test until you get it right.
3. Watch the tests run. If you are using Meteor v1.5+ the code reload should be fast.
4. Fix your code or tests until they are ok.

###### CI (single-run-mode)

1. Write your specs.
2. Run `NODE_ENV=test LATTE_MODE=run meteor --once`.
3. Watch test report.
4. Check the exit code to mark the build state.

#### Highlights

- It runs inside `Meteor's context` (any variable that is available when running the app is available on the tests).
- It connects to a `separate DB` from development's one (though on the same Mongo server). You can specify which DB to use by setting T.testingDbName. The default is `meteor_latte`. And *switches back to develop's db* after running tests.
- It `cleans up the database` upon start, and after running each describe block. So the DB state is clean for each test block.
- Simple (yet nice?) `console based report`.

##### Run selected tests

2 selection options:

- `ddescribe`. This can only be used on unnested describe blocks at the moment.
- `iit`. This can be used on any `it` block.

Also, you can select specific/s suites from the command line. To do so, you must put a label for the suites you want to include/exclude. Usage example:

```
describe('a suite name', function() { ... })
```

From the command line:

  * run only a list a suites: `NODE_ENV=test LATTE_MODE=run LATTE_SUITES='["a suite name"]' meteor --once`.
  * run all but a list a suites: `NODE_ENV=test LATTE_MODE=run LATTE_SUITES='["~a suite name"]' meteor --once`.

#### Gotchas

- `afterEach` must be declared before `it` blocks in each `describe` or `context` block.
- Cannot run assertions inside `before` or `after` blocks.
- Initially designed to work only on server side.
- If the internet connection is flaky, it might take some seconds to end the Meteor process (this is due to some Meteor's internals).

#### Original motivation

https://slides.com/canotto90/deck
