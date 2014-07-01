'use strict'

import {ACQUIRE, RELEASE, DISPOSE} from './signals'

export default function singletonify(create) {

	return function (value, resolveDeps, releaseDeps) {

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

		handlers[ACQUIRE] = function (value, args) {
			if (typeof instance === 'undefined') {
				instance = create.call(this, value, resolveDeps(), args)
			}
			count++
			return instance
		}

		handlers[RELEASE] = function (value) {
			count--
			if (count <= 0) {
				releaseDeps()
				dispose()
			}
		}

		handlers[DISPOSE] = function (value) {
			releaseDeps()
			dispose()
		}

		return function (signal, args) {
			return handlers[signal].call(this, value, args)
		}
	}
}