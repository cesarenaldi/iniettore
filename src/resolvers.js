'use strict'

import {
	leftCurryTwice,
	identity,
	compose,

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
	SINGLETON
} from './options'

export default function createResolvers() {
	
	var resolvers = {}

	resolvers[ generateType([VALUE]) ] = compose(leftCurryTwice, resolveDeps)(identity)
	resolvers[ generateType([CONSTRUCTOR]) ] = compose(leftCurryTwice, resolveDeps)(instanciate)
	resolvers[ generateType([CONSTRUCTOR, SINGLETON]) ] = compose(leftCurryTwice, singletonify)(instanciate)
	resolvers[ generateType([PROVIDER]) ] = compose(leftCurryTwice, resolveDeps)(invoke)
	resolvers[ generateType([SINGLETON, PROVIDER]) ] = compose(leftCurryTwice, singletonify)(invoke)

	return resolvers
}