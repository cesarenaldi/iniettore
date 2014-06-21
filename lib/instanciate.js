'use strict'

export default function instanciate(Ctor, args) {
	var Surrogate, instance
	
	Surrogate = function () {}
	Surrogate.prototype = Ctor.prototype

	instance = new Surrogate()

	Ctor.apply(instance, args)

	return instance
}