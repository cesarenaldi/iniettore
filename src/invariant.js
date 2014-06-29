'use strict'

var invariant = function(condition) {
  if (!condition) {
    throw new Error(
      'Minified exception occured; use the non-minified dev environment for ' +
      'the full error message and additional helpful warnings.'
    )
  }
}

if ("production" !== process.env.NODE_ENV) {
  invariant = function(condition, message) {
    if (message === undefined) {
      throw new Error('invariant requires an error message argument')
    }

    if (!condition) {
      throw new Error(`Invariant Violation: ${message}`)
    }
  }
}

export default invariant