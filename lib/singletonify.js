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

	handlers[ACQUIRE] = function (value, resolveDeps, releaseDeps) {
		if (typeof instance === 'undefined') {
			instance = fn.call(this, value, resolveDeps())
		}
		count++
		return instance
	}

	handlers[RELEASE] = function (value, resolveDeps, releaseDeps) {
		if (--count === 0) {
			releaseDeps()
			dispose()
		}
	}

	handlers[DISPOSE] = function (value, resolveDeps, releaseDeps) {
		releaseDeps()
		dispose()
	}

	return function (value, resolveDeps, releaseDeps, signal) {
		return handlers[signal].call(this, value, resolveDeps, releaseDeps)
	}
}