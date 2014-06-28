'use strict'

export default function instanciate(Ctor, deps, args) {
	var Surrogate, instance
	
	Surrogate = function () {}
	Surrogate.prototype = Ctor.prototype

	instance = new Surrogate()

	Ctor.apply(instance, deps.concat(args))

	return instance
}