'use strict'

import { generateMask } from './utils'
import { ACQUIRE, RELEASE, DISPOSE } from './signals'
import { PROVIDER } from './options'
import resolvers from './resolvers'
import { VALUE } from './options'
import createContext from './createContext';

var CONTAINER_ALIAS = '$container'
function noop() {}

class Container {

	constructor(conf, logger, mappings, signalRelease) {
		var context

		if (typeof conf !== 'function') {
			throw new Error('Invalid container creation, missing contribution function')
		}

		this._mappings = mappings || {}
		this._resolvers = resolvers
		this._logger = logger
		this._resolving = {}
		this._pending = []
		this._children = {}
		this._signalRelease = signalRelease || noop
		
		context = this._context = createContext(this._contribute.bind(this))
		context.map(CONTAINER_ALIAS).to(this).as(VALUE)
		context.flush()
		conf(context)
		context.flush()
	}

	get(alias, transients) {
		return this._logger.log(`resolving '${alias}'`, () => {
			if (this._resolving[alias]) { throw new Error(`Circular dependency detected while resolving '${alias}'`) }
			if (!(alias in this._mappings)) { throw new Error(`'${alias}' is not available. Has it ever been registered?.`) }

			this._resolving[alias] = true
			try {
				return this._mappings[alias](ACQUIRE)
			} catch(err) {
				err.message = `Failed while resolving '${alias}' due to:\n\t${err.message}`
				throw err
			} finally {
				this._resolving[alias] = false	
			}
		})
	}

	using(transientsDeps) {
		return {
			get: (alias) => {
				var context = this._context
				var dep

				for (dep in transientsDeps) {
					context.map(dep).to(transientsDeps[dep]).as(VALUE)
				}
				context.flush()
				this.get(alias)
				for (dep in transientsDeps) {
					this._unbind(dep)
				}
			}
		}
	}

	release(alias) {
		try {
			this._mappings[alias](RELEASE)
		} catch(err) {
			err.message = `Failed while releasing '${alias}' due to:\n\t${err.message}`
			throw err
		}
	}

	createChild(conf) {
		var id = Object.keys(this._children).length + 1
		var child = new Container(conf, this._logger, Object.create(this._mappings), this._releaseChild.bind(this, id))

		this._children[id] = child
		return child
	}

	dispose() {
		this._disposeChildren()
		this._disposeInstances()
		this._signalRelease()
		this._signalRelease = noop
	}

	_disposeChildren() {
		var children = this._children
		var id

		for (id in children) {
			/* istanbul ignore else  */
			if (children.hasOwnProperty(id)) {
				children[id].dispose()
				this._releaseChild(id)
			}
		}
	}

	_releaseChild(id) {
		delete this._children[id]
	}

	_disposeInstances() {
		var mappings = this._mappings
		var alias

		for (alias in mappings) {
			/* istanbul ignore else  */
			if (mappings.hasOwnProperty(alias)) {
				try {
					mappings[alias](DISPOSE)
				} catch(err) {
					err.message = `Failed while disposing '${alias}' due to:\n\t${err.message}`
					throw err
				}
				delete mappings[alias]
			}
		}
	}

	_contribute(alias, value, type, deps) {
		if ( !(type in this._resolvers) ) {
			throw new Error('Invalid flags combination. See documentation for valid flags combinations.')
		}
		this._mappings[alias] = this._resolvers[type].call(null, value, this._resolve.bind(this, deps), this._release.bind(this, deps))

	}

	_unbind(alias) {
		this._mappings[alias](DISPOSE)
		delete this._mappings[alias]
	}

	_release(deps) {
		return deps.forEach((dep) => {
			this.release(dep)
		})
	}

	_resolve(deps) {
		return deps.map((dep) => {
			return this.get(dep)
		})
	}
}

export default Container