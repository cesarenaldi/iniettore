'use strict'

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

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
		return getParamNames(func).reduce(function (deps, name) {
			if (name.indexOf('$') === 0) {
				deps.push(name.substring(1))
			}
			return deps
		}, [])
	}
	return []
}
