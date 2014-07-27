'use strict'

import {ACQUIRE, RELEASE, DISPOSE} from './signals'

export default function singletonify(create, persistent) {

	persistent = persistent || false

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

		handlers[ACQUIRE] = function (value) {
			if (typeof instance === 'undefined') {
				instance = create.call(this, value, resolveDeps())
			}
			count++
			return instance
		}

		handlers[RELEASE] = function (value) {
			count--
			if (count == 0 && !persistent) {
				releaseDeps()
				dispose()
			}
		}

		handlers[DISPOSE] = function (value) {
			if (instance) {
				releaseDeps()
				dispose()
			}
		}

		return function (signal) {
			return handlers[signal].call(this, value)
		}
	}
}