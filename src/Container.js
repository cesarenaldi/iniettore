'use strict'

import { generateMask } from './utils'
import { ACQUIRE, RELEASE, DISPOSE } from './signals'
import { PROVIDER } from './options'
import resolvers from './resolvers'
import { VALUE } from './options'
import createContext from './createContext';
import log from './log'

var ALIAS_IDX = 0
var VALUE_IDX = 1
var TYPE_IDX = 2
var DEPS_IDX = 3

var CONTAINER_ALIAS = '$container'

class Container {

	constructor(conf, mappings) {

		var context

		if (typeof conf !== 'function') {
			throw new Error('Invalid container creation, missing contribution function')
		}
		this._resolvers = resolvers
		this._mappings = mappings || {}
		this._resolving = {}
		this._pending = []
		
		this.bind(CONTAINER_ALIAS, this).as(VALUE).done()
		context = createContext(this, this._contribute.bind(this))
		conf(context)
		context.flush()
		if (this._pending.length) {
			this._done()
		}
	}

	bind(alias, value) {
		this._pending = [alias, value]

		return {
			
			as: (...flags) => {
				this._pending[TYPE_IDX] = generateMask(flags)

				return {

					bind: (...args) => {
						this._done()
						return this.bind.apply(this, args)
					},

					inject: (...deps) => {
						this._pending[DEPS_IDX] = deps

						return {
							bind: (...args) => {
								this._done()
								return this.bind.apply(this, args)
							},

							done: () => this._done()
						}
					},

					done: () => this._done()
				}
			}
		}
	}

	get(alias, transients) {

		var value, error

		log(`Resolving ${alias}`)

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

		log.done()

		return value
	}

	using(transientsDeps) {
		return {
			get: (alias) => {
				var dep

				for (dep in transientsDeps) {
					this.bind(dep, transientsDeps[dep]).as(VALUE).done()
				}
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
		return new Container(conf, Object.create(this._mappings))
	}

	createBlueprint(alias, blueprint) {
		return {
			exports: (mapping) => {
				return {
					done: () => this.bind(alias, () => this.createChild(blueprint).get(mapping)).as(PROVIDER).done()
				}
			},
			done: () => this.bind(alias, () => this.createChild(blueprint)).as(PROVIDER).done()
		}
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

	_done() {

		var pending = this._pending

		this._contribute(pending[ALIAS_IDX], pending[VALUE_IDX], pending[TYPE_IDX], pending[DEPS_IDX])

		this._pending = []
		return this
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