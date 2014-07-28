'use strict'

export default = [
	'VALUE',
	'PROVIDER',
	'CONSTRUCTOR',
	'SINGLETON',
	'FUNCTION',
	'INSTANCE',
	'PERSISTENT',
	'TRANSIENT',
	'BLUEPRINT',
	'EAGER'
].reduce(function (options, flag, idx) {
	options[flag] = Math.pow(2, idx)
	return options
}, {})