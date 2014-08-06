'use strict'

import Context from './Context'
import Logger from './Logger'

export function create(conf, options) {
	var logger

	options = options || {}
	logger = new Logger(options)

	return new Context(conf, logger)
}