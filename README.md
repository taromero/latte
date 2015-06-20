## Latte

#### What it is

Testing framework to write mocha-like specs, without the need of using Velocity.

#### What it is not

This is not intended as a replacement to Velocity. It lacks some important Velocity features (for example running in parallel while you code, or having an HTML reporter).

#### Motivation

Velocity's goal is complex, and I've experienced some issues while working with it. I agree that Velocity is a great idea, but I still feel it a bit unstable. Also, some features can be unnecessary overhead from **some** projects.

The aim of this project is to provide a minimal library to just run specs mocha-style, upon running a command. No reactive feedback of test whie coding, no mirrors, no common platform for different testing frameworks (which are all good things). Simplicity. You can only run unit and integration test currenty.

#### Workflow

1. Write your specs.
2. Run `METEOR_ENV=test meteor --test`.
3. Watch test report.
4. Watch the run finish returning the exit code (useful for CI).

#### Features

- It connects to a separate DB from development's one. You can specify which DB to use by setting T.testingDbUrl. The default is `mongodb://127.0.0.1:3001/meteor_latte`.
- It cleans up the database upon start, and after running each describe block.
- Simple (yet nice?) console based report.
- It runs inside Meteor's context (you can user global variables, such as Meteor collections).

#### Gotchas

- Very early stage of development.
- Initially designed to work only on server side.

#### How to use

1. `meteor add canotto90:latte`
2. Write a spec anywhere in a server directory.
3. The spec should be contained inside a `Meteor.startup` call.
4. Inside any `Meteor.startup` call, run:
```
Meteor.setTimeout(function() {
  T.run()
})
```
5. On the command line, run: `METEOR_ENV=test meteor --test`

#### TODOS

- Add colors to the report.
- Add `before` and `after` blocks.
- Remove the need for `Meteor.startup` wrap on every spec file.
- Allow working with `METEOR_ENV=test meteor` run tests automatically when files change (while working on testing).
- Others.