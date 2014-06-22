'use strict'

var count = 0
var indentation = Array(count).join('\s')
var message

function log(msg) {
	count++
	message = msg
	// console.log(`${indentation}${message}: BEGIN`)
	indentation = Array(count).join(' ')
}

log.done = function () {
	// console.log(`${indentation}${message}: DONE`)
	count--
}

export default log