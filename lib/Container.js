'use strict'

import generateType from './generateType'
import invariant from './invariant'
import {ACQUIRE, RELEASE, DISPOSE} from './signals'
import createResolvers from './resolvers'
import VALUE from './options'


var ALIAS = 0
var VALUE = 1
var TYPE = 2
var DEPS = 3

var CONTAINER_ALIAS = '$container'

class Container {

	constructor(mappings) {
		this._resolvers = createResolvers()
		this._mappings = mappings || {}
		this._resolving = {}
		this._pending = []
		this
			.bind(CONTAINER_ALIAS, this)
			.as(VALUE)
			.done()
	}

	bind(alias, value) {
		this._pending = [alias, value]
		return this
	}

	as(...flags) {
		this._pending[TYPE] = generateType(flags)
		return this
	}

	inject(...deps) {
		this._pending[DEPS] = deps
		return this
	}

	done() {

		var pending = this._pending
		var deps = pending[DEPS] ? pending[DEPS] : []
		var resolver = this._resolvers[ pending[TYPE] ](pending[VALUE], this._resolve.bind(this, deps), this._release.bind(this, deps))

		this._mappings[pending[ALIAS]] = resolver

		this._pending = []
		return this
	}

	get(alias) {

		var value

		invariant(!this._resolving[alias], 'Circular dependency detected while resolving `%s`.', alias)

		this._resolving[alias] = true
		try {
			value = this._mappings[alias](ACQUIRE)
		} catch(e) {
			throw new Error('Failed while resolving `' + alias + '`')
		}
		this._resolving[alias] = false

		return value
	}

	release(alias) {
		try {
			this._mappings[alias](RELEASE)
		} catch(e) {
			throw new Error('Failed while disposing `' + alias + '`')
		}
	}

	createChild() {
		return new Container(Object.create(this._mappings))
	}

	dispose() {

		var mappings = this._mappings
		var alias

		for (alias in mappings) {
			if(mappings.hasOwnProperty(alias)) {
				try {
					mappings[alias](DISPOSE)
				} catch(e) {
					throw new Error('Failed while disposing `' + alias + '`')			
				}
			}
		}
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