'use strict'

import {ACQUIRE, RELEASE, DISPOSE} from './signals'

export default function singletonify(fn) {

	var handlers = {}
	var count = 0
	var instance

	function dispose() {
		if (typeof instance.dispose === 'function') {
			instance.dispose()
		}
		instance = undefined
		count = 0
	}

	handlers[ACQUIRE] = function (value, resolveDeps, releaseDeps, args) {
		if (typeof instance === 'undefined') {
			instance = fn.call(this, value, resolveDeps(), args)
		}
		count++
		return instance
	}

	handlers[RELEASE] = function (value, resolveDeps, releaseDeps) {
		count--
		if (count <= 0) {
			releaseDeps()
			dispose()
		}
	}

	handlers[DISPOSE] = function (value, resolveDeps, releaseDeps) {
		releaseDeps()
		dispose()
	}

	return function (value, resolveDeps, releaseDeps, signal, args) {
		return handlers[signal].call(this, value, resolveDeps, releaseDeps, args)
	}
}