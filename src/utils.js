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
	return function (value, resolve, release, signal) {
		return fn.call(this, value, resolve())
	}
}

export function invoke(fn, deps) {
	return fn.apply(null, deps)
}

export function partial(func, boundArgs) {
	return function (...args) {
		return func.apply(this, boundArgs.concat(args))
	}
}

export function generateMask(flags) {
	return flags.reduce((prev, curr) => prev | curr, 0)
}

export { instanciate, singletonify }