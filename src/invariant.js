'use strict'

var invariant = function(condition) {
  if (!condition) {
    var error = new Error(
      'Minified exception occured; use the non-minified dev environment for ' +
      'the full error message and additional helpful warnings.'
    );
    error.framesToPop = 1;
    throw error
  }
}

if ("production" !== process.env.NODE_ENV) {
  invariant = function(condition, format, a, b, c, d, e, f) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument')
    }

    if (!condition) {
      var args = [a, b, c, d, e, f]
      var argIndex = 0
      var error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++] })
      )
      error.framesToPop = 1 // we don't care about invariant's own frame
      throw error
    }
  }
}

export default invariant