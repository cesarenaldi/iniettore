'use strict'

import Container from './Container'

export function create(conf, options) {
	options = options || {}
	return new Container(conf, options)
}