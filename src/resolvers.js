'use strict'

import {
	leftCurryTwice,
	identity,
	compose,
	partial,

	resolveDeps,
	invoke,

	instanciate,
	singletonify,

	generateMask
} from './utils'

import {
	VALUE,
	PROVIDER,
	CONSTRUCTOR,
	SINGLETON,
	FUNCTION,
	INSTANCE,
	TRANSIENT,
	PERSISTENT,
	EAGER
} from './options'
	
var resolvers = {}

resolvers[ generateMask([VALUE]) ] = compose(leftCurryTwice, resolveDeps)(identity)
resolvers[ generateMask([FUNCTION]) ] = compose(leftCurryTwice, resolveDeps)(partial)
resolvers[ generateMask([CONSTRUCTOR]) ] = compose(leftCurryTwice, resolveDeps)(instanciate)
resolvers[ generateMask([TRANSIENT, CONSTRUCTOR, SINGLETON]) ] = singletonify(instanciate)
resolvers[ generateMask([PERSISTENT, CONSTRUCTOR, SINGLETON]) ] = singletonify(instanciate, true)
resolvers[ generateMask([PROVIDER]) ] = compose(leftCurryTwice, resolveDeps)(invoke)
resolvers[ generateMask([TRANSIENT, SINGLETON, PROVIDER]) ] = singletonify(invoke)
resolvers[ generateMask([PERSISTENT, SINGLETON, PROVIDER]) ] = singletonify(invoke, true)

resolvers[ generateMask([EAGER, SINGLETON, PROVIDER])] = invoke(singletonify(invoke, true))
resolvers[ generateMask([EAGER, CONSTRUCTOR, SINGLETON]) ] = invoke(singletonify(instanciate, true))

// aliases
resolvers[ generateMask([INSTANCE]) ] = resolvers[ generateMask([VALUE]) ]

export default resolvers