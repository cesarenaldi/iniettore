import { CONTEXT_ALIAS } from './constants'

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm
var ARGUMENT_NAMES = /([^\s,]+)/g

function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '')
  var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)

  if (result === null) {
    return []
  }
  return result
}

export default function extractImplicitDependencies(func) {
  if (typeof func === 'function') {
    return getParamNames(func).reduce(function(deps, name) {
      if (name.indexOf('$') === 0) {
        if (CONTEXT_ALIAS !== name) {
          name = name.substring(1)
        }
        deps.push(name)
      }
      return deps
    }, [])
  }
  return []
}
