## Latte

[![Build Status](https://travis-ci.org/taromero/latte.svg?branch=master)](https://travis-ci.org/taromero/latte)

![](https://raw.githubusercontent.com/taromero/latte/master/readme_images/latte.png)
![](https://raw.githubusercontent.com/taromero/latte/master/readme_images/latte_failure_example.png)

#### What it is

Testing framework to write mocha-like specs, without the need of using Velocity.

#### What it is not

This is not intended as a replacement to Velocity. It lacks some important Velocity features (for example running in parallel while you code, or having an HTML reporter).

#### Motivation

Velocity's goal is complex, and I've experienced some issues while working with it. I agree that Velocity is a great idea, but I still feel it a bit unstable. Also, some features can be unnecessary overhead from **some** projects.

The aim of this project is to provide a minimal library to just run specs mocha-style, upon running a command. No reactive feedback of test whie coding, no mirrors, no common platform for different testing frameworks (which are all good things). Simplicity. You can only run unit and integration test currenty.

#### Workflow

1. Write your specs.
2. Run `RUN_TESTS=1 meteor --once`.
3. Watch test report.
4. Watch the run finish returning the exit code (useful for CI).

#### Features

- It connects to a `separate DB` from development's one. You can specify which DB to use by setting T.testingDbUrl. The default is `mongodb://127.0.0.1:3001/meteor_latte`.
- It `cleans up the database` upon start, and after running each describe block.
- Simple (yet nice?) `console based report`.
- It runs inside `Meteor's context` (you can user global variables, such as Meteor collections).

#### Gotchas

- `afterAll` and `afterEach` must be declared before `it` blocks in each `describe` or `context` block.
- Cannot run assertions inside `before` or `after` blocks.
- Initially designed to work only on server side.
- If the internet connection is flacky, it might take some seconds to end the Meteor process (this is due to some Meteor's internals).

#### How to use

1. `meteor add canotto90:latte`.
2. `meteor add practicalmeteor:chai`. Latte needs an assetion library, and I've been using ChaiJS.
2. Write a spec anywhere in a server directory.
3. The spec should be contained inside a `T.suite` call.
5. On the command line, run: `RUN_TESTS=1 meteor --once`

##### Run tests on code change

Use `RUN_TESTS=cont meteor` to run tests automatically when files change. `CONTINUOUS_TESTING` tells Latte not to end the Meteor process. Ideally, not using the `--once` argument should be enough to allow continuous testing, but doesn't seem to be a way to detect which arguments were used when running meteor (like we can in simple nodejs apps).

Latte uses testing's DB when running tests, and switches back to develop's db after running tests.

##### How to debug tests

As latte doesn't use mirrors, it's just like debugging regular Meteor code. Run `RUN_TESTS=true meteor debug`, and either use node inspector or node's CLI tool (by running `node debug localhost:5858` on a separate console).

##### Run selected tests

2 selection options:

- `T.ssuite`.
- `iit`.

Also, you can select specific/s suites from the command line. To do so, you must put a label for the suites you want to include/exclude. Usage example:

```
T.suite('a suite name', function() { ... })
```

From the command line:

  * run only a list a suites: `RUN_TESTS=1 LATTE_SUITES=["a suite name"] meteor --once`.
  * run all but a list a suites: `RUN_TESTS=1 LATTE_SUITES=["~a suite name"] meteor --once`.

#### Known TODOS

- Add timeout failures.
- Add code coverage tool support.
- Add ability to run only tests that cover the changed section of code (?).
- Allow specifying suite to run on test command.
