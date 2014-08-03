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
	PERSISTENT,
	TRANSIENT,
	LAZY,
	EAGER
} from './options'
	
var resolvers = {}

resolvers[ generateMask([VALUE]) ] = compose(leftCurryTwice, resolveDeps)(identity)
resolvers[ generateMask([FUNCTION]) ] = compose(leftCurryTwice, resolveDeps)(partial)
resolvers[ generateMask([CONSTRUCTOR]) ] = compose(leftCurryTwice, resolveDeps)(instanciate)
resolvers[ generateMask([PROVIDER]) ] = compose(leftCurryTwice, resolveDeps)(invoke)

resolvers[ generateMask([TRANSIENT, SINGLETON, PROVIDER]) ] = singletonify(invoke)
resolvers[ generateMask([TRANSIENT, CONSTRUCTOR, SINGLETON]) ] = singletonify(instanciate)

resolvers[ generateMask([LAZY, SINGLETON, PROVIDER]) ] = singletonify(invoke, true)
resolvers[ generateMask([LAZY, SINGLETON, CONSTRUCTOR]) ] = singletonify(instanciate, true)

resolvers[ generateMask([EAGER, SINGLETON, PROVIDER])] = singletonify(invoke, true)
resolvers[ generateMask([EAGER, SINGLETON, CONSTRUCTOR]) ] = singletonify(instanciate, true)

// aliases
resolvers[ generateMask([INSTANCE]) ] = resolvers[ generateMask([VALUE]) ]

// backward compatibility
resolvers[ generateMask([PERSISTENT, SINGLETON, PROVIDER]) ] = resolvers[ generateMask([LAZY, SINGLETON, PROVIDER]) ]
resolvers[ generateMask([PERSISTENT, CONSTRUCTOR, SINGLETON]) ] = resolvers[ generateMask([LAZY, CONSTRUCTOR, SINGLETON]) ]

export default resolvers