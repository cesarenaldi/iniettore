'use strict'

import {
	leftCurryTwice,
	identity,
	memoize,
	compose
} from './utils'

import instanciate from './instanciate'
import invoke from './invoke'
import singletonify from './singletonify'
import resolveDeps from './resolveDeps'

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