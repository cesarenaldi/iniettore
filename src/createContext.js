'use strict';

import { generateMask } from './utils'

var ALIAS_IDX = 0
var VALUE_IDX = 1
var TYPE_IDX = 2
var DEPS_IDX = 3

export default function context(container, contribute) {

	var pending = []
	
	var context = {

		bind: function (...args) {
			return container.bind.apply(container, args)
		},

		map: (alias) => {
			pending.push(alias)

			return {
				to: (value) => {

					pending.push(value)

					return {
						as: (...flags) => {

							pending.push(generateMask(flags))

							return {
								map: (next) => {
									pending.push([])
									context.flush()
									return context.map.call(this, next)
								},
								
								injecting: (...deps) => {
									pending.push(deps)

									return {
										map: (next) => {
											context.flush()
											return context.map.call(this, next)
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
			if (pending.length) {
				contribute(pending[ALIAS_IDX], pending[VALUE_IDX], pending[TYPE_IDX], pending[DEPS_IDX])
				pending = []
			}
		}
	}

	return context
}