'use strict'

import Context from './Context'
import Logger from './Logger'

import options from './options'

function create(conf, options) {
	var logger;

	options = options || {};
	logger = new Logger(options);

	return new Context(conf, logger);
}

export default Object.create(options, {
	create: {
		value: create
	}
})
