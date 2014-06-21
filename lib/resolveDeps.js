'use strict'

export default function resolveDeps(fn) {
	return function (value, resolve) {
		return fn.call(this, value, resolve())
	}
}