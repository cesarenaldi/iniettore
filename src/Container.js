'use strict'

import { generateMask } from './utils'
import { ACQUIRE, RELEASE, DISPOSE } from './signals'
import { PROVIDER } from './options'
import resolvers from './resolvers'
import { VALUE } from './options'
import createContext from './createContext';
import Logger from './Logger'

var CONTAINER_ALIAS = '$container'

class Container {

	constructor(conf, options, mappings, logger) {

		var context

		if (typeof conf !== 'function') {
			throw new Error('Invalid container creation, missing contribution function')
		}
		this._resolvers = resolvers
		this._mappings = mappings || {}
		this._logger = logger || new Logger(options)
		this._resolving = {}
		this._pending = []
		
		context = this._context = createContext(this._contribute.bind(this))
		context.map(CONTAINER_ALIAS).to(this).as(VALUE)
		context.flush()
		conf(context)
		context.flush()
	}

	get(alias, transients) {
		return this._logger.log(`resolving '${alias}'`, () => {
			var value, error

			if (this._resolving[alias]) { throw new Error(`Circular dependency detected while resolving '${alias}'`) }
			if (!(alias in this._mappings)) { throw new Error(`'${alias}' is not available. Has it ever been registered?.`) }

			this._resolving[alias] = true
			try {
				value = this._mappings[alias](ACQUIRE)
			} catch(err) {
				err.message = `Failed while resolving '${alias}' due to:\n\t${err.message}`
				throw err
			}
			this._resolving[alias] = false

			return value
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
			err.message = `Failed while disposing '${alias}' due to:\n\t${err.message}`
			throw err
		}
	}

	createChild(conf) {
		return new Container(conf, this._options, Object.create(this._mappings), this._logger)
	}

	dispose() {

		var mappings = this._mappings
		var alias

		for (alias in mappings) {
			if (mappings.hasOwnProperty(alias)) {
				try {
					mappings[alias](DISPOSE)
				} catch(err) {
					err.message = `Failed while disposing '${alias}' due to:\n\t${err.message}`
					throw err
				}
			}
		}
	}

	_contribute(alias, value, type, deps) {

		deps = deps || []

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