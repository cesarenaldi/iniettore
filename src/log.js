'use strict'

var count = 0
var indentation, message

function log(msg) {
	count++
	message = msg
	indentation = Array(count * 2).join(' ')
	// console.log(`${indentation}${message}: BEGIN`)
}

log.done = function () {
	// console.log(`${indentation}${message}: DONE`)npm
	count--
}

export default log