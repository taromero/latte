module.exports = {
  describe (label, fn) {
    return this._descriptionBlock('describe')(label, fn)
  },
  context (label, fn) {
    return this._descriptionBlock('context')(label, fn)
  },
  ddescribe (label, fn) {
    return this._descriptionBlock('describe', { runOnly: true })(label, fn)
  },
  ccontext (label, fn) {
    return this._descriptionBlock('context', { runOnly: true })(label, fn)
  },
  _descriptionBlock (type, options = {}) {
    const T = this

    return function analyzeOrExec (label, fn) {
      if (
        T.deepLevel === 0 &&
        options.runOnly &&
        !T.excludedSuite(T.onlySuites, label) &&
        !T.onlySuitesAsUserParams
      ) {
        T.onlySuites.push(label)
      }
      if (T.deepLevel === 0 && T.preventsSuiteFromRunning(label)) {
        return
      }

      return T.analyzing ? analizeBlock(label, fn) : describeBlock(label, fn)
    }

    function analizeBlock (label, fn) {
      if (T.deepLevel === 0) {
        var testSuite = describeBlock.bind(this, label, fn)
        T.currentRootDescribeBlock = testSuite
        T.suites.push(testSuite)
      }
      T.deepLevel++
      fn()
      T.deepLevel--
    }

    function describeBlock (label, fn) {
      if (T.deepLevel === 0 && T.preventsSuiteFromRunning(label)) {
        return
      }
      T.describeMessages.push(T.message(type, label, T.deepLevel))
      T.deepLevel++
      fn()
      T.itBlockRunLevel = T.deepLevel
      T.describeMessages = []
      T._contextBlocks.forEach(filterFromSameLevel)
      T.deepLevel--
    }

    function filterFromSameLevel (blockName) {
      T[blockName + 'Blocks'] = T[blockName + 'Blocks'].filter(differentLevel)

      function differentLevel (obj) {
        return obj.deepLevel !== T.deepLevel
      }
    }
  },
  preventsSuiteFromRunning (label) {
    const T = this

    // allows to pass { label: '...', fn: ... } as arg
    if (label.label) label = label.label

    return (
      T.excludedSuite(label) ||
      (T.onlySuites.some(isInclusionOnly) && !T.onlySuites.some(included))
    )

    function isInclusionOnly (onlySuite) {
      return !onlySuite.startsWith('~')
    }

    function included (onlySuite) {
      return onlySuite === label
    }
  },
  excludedSuite (label) {
    const T = this
    return T.onlySuites.some(excluded)

    function excluded (onlySuite) {
      if (onlySuite.startsWith('~')) {
        if (onlySuite.replace('~', '') === label) {
          return true
        }
      }
    }
  }
}
