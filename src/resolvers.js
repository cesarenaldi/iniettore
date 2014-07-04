'use strict'

import {
	leftCurryTwice,
	identity,
	compose,
	partial,

	resolveDeps,
	invoke,

	instanciate,
	singletonify
} from './utils'

import generateType from './generateType'
import {
	VALUE,
	PROVIDER,
	CONSTRUCTOR,
	SINGLETON,
	FUNCTION,
	INSTANCE
} from './options'
	
var resolvers = {}

resolvers[ generateType([VALUE]) ] = compose(leftCurryTwice, resolveDeps)(identity)
resolvers[ generateType([FUNCTION]) ] = compose(leftCurryTwice, resolveDeps)(partial)
resolvers[ generateType([CONSTRUCTOR]) ] = compose(leftCurryTwice, resolveDeps)(instanciate)
resolvers[ generateType([CONSTRUCTOR, SINGLETON]) ] = singletonify(instanciate)
resolvers[ generateType([PROVIDER]) ] = compose(leftCurryTwice, resolveDeps)(invoke)
resolvers[ generateType([SINGLETON, PROVIDER]) ] = singletonify(invoke)

// aliases
resolvers[ generateType([INSTANCE]) ] = resolvers[ generateType([VALUE]) ]

export default resolvers