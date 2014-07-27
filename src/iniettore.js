'use strict'

import Container from './Container'
import Logger from './Logger'

export function create(conf, options) {
	var logger

	options = options || {}
	logger = new Logger(options)

	return new Container(conf, logger)
}