'use strict'

import instanciate from './instanciate'
import singletonify from './singletonify'

export function identity(value) { return value }

export function leftCurryTwice(fn) {
	return function firstCurry(...firstArgs) {
		return function secondCurry(...secondArgs) {
			return fn.apply(null, firstArgs.concat(secondArgs))
		}
	}
}

// not used
export function memoize(fn) {

	var value

	return function (...args) {
		if (typeof value === 'undefined') {
			value = fn.apply(this, args)
		}
		return value
	}
}

export function compose(...funcs) {
	return function (...args) {

		var i

		for (i = funcs.length - 1; i >= 0; i--) {
			args = [funcs[i].apply(this, args)]
		}
		return args[0]
	}
}

export function resolveDeps(fn) {
	return function (value, resolve, release, signal, args) {
		return fn.call(this, value, resolve(), args)
	}
}

export function invoke(fn, deps, args) {
	return fn.apply(null, deps.concat(args))
}

// not used
export function merge(first, ...sources) {
	return sources.reduce(function (out, source) {
		for (var k in source) {
			out[k] = source[k]
		}
		return out
	}, first)
}

export { instanciate, singletonify }