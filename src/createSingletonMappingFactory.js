export default function createSingletonMappingFactory(create, isTransient = false) {
	return function (value, resolveDeps, releaseDeps) {
		var handlers = {}
		var count = 0
		var instance

		return {
			get() {
				if (typeof instance === 'undefined') {
					instance = create.call(this, value, resolveDeps())
				}
				count++
				return instance
			},
			release() {
				count--
				if (count == 0 && isTransient) {
					this.dispose()
				}
			},
			dispose() {
				if (instance) {
					releaseDeps()
					if (typeof instance.dispose === 'function') {
						instance.dispose()
					}
					instance = undefined
					count = 0
				}
			}
		}
	}
}
