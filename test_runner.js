T.postRunCallback(function() {
  if (suiteIncludedCounter != 2) {
    throw 'ignored `suite` tests that should not have been ignored'
  }
  if (itIncludedCounter != 1) {
    throw 'ignored `it` tests that should not have been ignored'
  }
})

