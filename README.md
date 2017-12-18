## Latte

[![Build Status](https://travis-ci.org/taromero/latte.svg?branch=master)](https://travis-ci.org/taromero/latte)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

![](https://raw.githubusercontent.com/taromero/latte/master/readme_images/latte.png)
![](https://raw.githubusercontent.com/taromero/latte/master/readme_images/latte_debugging.png)

#### What

Testing framework to write mocha-esque specs, without the need of using Velocity.

#### Motivation

Velocity's goal is complex, and I've experienced some issues while working with it. I agree that Velocity is a great idea, but I still feel it a bit unstable. Also, some features can be unnecessary overhead for **some** projects.

The aim of this project is to provide a minimal library to just run specs mocha-style, upon running a command. No reactive feedback of test while coding, no mirrors, no common platform for different testing frameworks (which are all good things). Simplicity. You can only run unit and integration test currently.

#### How to use

1. `meteor add canotto90:latte`.
2. `meteor add practicalmeteor:chai`. Latte needs an assertion library, and I've been using ChaiJS.
2. Write a spec anywhere in a server directory.
5. On the command line, run: `NODE_ENV=test RUN_TESTS=1 meteor --once`

#### Workflow

1. Write your specs.
2. Run `NODE_ENV=test RUN_TESTS=1 meteor --once`.
3. Watch test report.
4. Watch the run finish returning the exit code (useful for CI).

#### Features

- It connects to a `separate DB` from development's one (though on the same Mongo server). You can specify which DB to use by setting T.testingDbName. The default is `meteor_latte`.
- It `cleans up the database` upon start, and after running each describe block.
- Simple (yet nice?) `console based report`.
- It runs inside `Meteor's context` (you can user global variables, such as Meteor collections).

#### How to debug

As latte doesn't use mirrors, it's just like debugging regular Meteor code. Run `NODE_ENV=test RUN_TESTS=true meteor debug`, and either use node inspector or node's CLI tool.

Option A - Node Inspector:

`NODE_ENV=test RUN_TESTS=1 meteor debug --once`. Then open chrome with the provided URL (usually `http://localhost:8080/debug?port=5858`).

Option B - Node CLI Debugger:

`NODE_ENV=test RUN_TESTS=1 NODE_OPTIONS=--debug-brk meteor --once`. Then on a different terminal run `node debug localhost:5858`. Ref: https://nodejs.org/api/debugger.html.

##### Run tests on code change

Use `NODE_ENV=test RUN_TESTS=cont meteor` to run tests automatically when files change. `cont` tells Latte not to end the Meteor process. Ideally, not using the `--once` argument should be enough to allow continuous testing, but doesn't seem to be a way to detect which arguments were used when running meteor (like we can in simple nodejs apps).

Latte uses testing's DB when running tests, and *switches back to develop's db* after running tests.

##### Run selected tests

2 selection options:

- `ddescribe`. This can only be used on unnested describe blocks at the moment.
- `iit`. This can be used on any `it` block.

Also, you can select specific/s suites from the command line. To do so, you must put a label for the suites you want to include/exclude. Usage example:

```
describe('a suite name', function() { ... })
```

From the command line:

  * run only a list a suites: `NODE_ENV=test RUN_TESTS=1 LATTE_SUITES='["a suite name"]' meteor --once`.
  * run all but a list a suites: `NODE_ENV=test RUN_TESTS=1 LATTE_SUITES='["~a suite name"]' meteor --once`.

#### Gotchas

- `afterEach` must be declared before `it` blocks in each `describe` or `context` block.
- Cannot run assertions inside `before` or `after` blocks.
- Initially designed to work only on server side.
- If the internet connection is flaky, it might take some seconds to end the Meteor process (this is due to some Meteor's internals).

