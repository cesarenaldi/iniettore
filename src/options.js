'use strict'

export default = [
	'VALUE',
	'PROVIDER',
	'CONSTRUCTOR',
	'SINGLETON',
	'FUNCTION',
	'INSTANCE'
].reduce(function (options, flag, idx) {
	options[flag] = Math.pow(2, idx)
	return options
}, {})