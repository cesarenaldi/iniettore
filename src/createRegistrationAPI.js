'use strict';

import { generateMask } from './utils'
import { BLUEPRINT, PROVIDER } from './options'
import { CONTEXT_ALIAS } from './constants'

var ALIAS_IDX = 0
var VALUE_IDX = 1
var TYPE_IDX = 2
var DEPS_IDX = 3

function createChildContextFactory(conf) {
	return function (context) {
		return context.createChild(conf)
	}
}

function createExporter(contextFactory, exportAlias) {
	return function (configure) {
		return contextFactory(configure).get(exportAlias)
	}
}

export default function createRegistrationAPI(contribute) {

	var pending = []
	var api = {

		map: (alias) => {
			api.done()
			pending.push(alias)

			return {
				to: (value) => {

					pending.push(value)

					return {
						as: (...flags) => {
							var mask = generateMask(flags)

							if (mask === BLUEPRINT) {
								// test if VALUE is a function
								flags = [PROVIDER]
								pending[VALUE_IDX] = createChildContextFactory(pending[VALUE_IDX])
								pending.push(generateMask(flags))
								pending.push([CONTEXT_ALIAS])
								
								return {
									exports: (alias) => {
										pending[VALUE_IDX] = createExporter(pending[VALUE_IDX], alias)
									}
								}
							}

							pending.push(mask)
							
							return {								
								injecting: (...deps) => {
									pending.push(deps)
								}
							}
						}
					}
				}
			}
		},

		done: () => {
			var deps = pending[DEPS_IDX] || []

			if (pending.length > 2) {
				contribute(pending[ALIAS_IDX], pending[VALUE_IDX], pending[TYPE_IDX], deps)
				pending = []
			}
		}
	}

	return api
}