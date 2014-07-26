'use strict';

import { generateMask } from './utils'
import { BLUEPRINT, PROVIDER } from './options'

var ALIAS_IDX = 0
var VALUE_IDX = 1
var TYPE_IDX = 2
var DEPS_IDX = 3

function createChildContainerFactory(conf) {
	return function (container) {
		return container.createChild(conf)
	}
}

function createExporter(containerFactory, exportAlias) {
	return function (container) {
		return containerFactory(container).get(exportAlias)
	}
}

export default function createContext(contribute) {

	var pending = []
	var context = {

		map: (alias) => {
			pending.push(alias)

			return {
				to: (value) => {

					pending.push(value)

					return {
						as: (...flags) => {

							if (flags.length === 1 && flags[0] === BLUEPRINT) {
								// test if VALUE is a function
								flags = [PROVIDER]
								pending[VALUE_IDX] = createChildContainerFactory(pending[VALUE_IDX])
								pending.push(generateMask(flags))
								pending.push(['$container'])
								
								return {
									exports: (alias) => {
										pending[VALUE_IDX] = createExporter(pending[VALUE_IDX], alias)
										context.flush()
										return {
											map: context.map
										}
									},
									map: (alias) => {
										context.flush()
										return context.map.call(this, alias)
									}
								}
							}

							pending.push(generateMask(flags))

							return {
								map: (alias) => {
									pending.push([])
									context.flush()
									return context.map.call(this, alias)
								},
								
								injecting: (...deps) => {
									pending.push(deps)

									return {
										map: (alias) => {
											context.flush()
											return context.map.call(this, alias)
										}
									}
								}
							}
						}
					}
				}
			}
		},

		flush: () => {
			if (pending.length > 2) {
				contribute(pending[ALIAS_IDX], pending[VALUE_IDX], pending[TYPE_IDX], pending[DEPS_IDX])
				pending = []
			}
		}
	}

	return context
}