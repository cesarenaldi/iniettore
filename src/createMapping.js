'use strict'

import { identity, partial, invoke, instanciate, generateMask } from './utils'
import createSimpleMappingFactory from './createSimpleMappingFactory'
import createSingletonMappingFactory from './createSingletonMappingFactory'
import createPropertyMapper from './createPropertyMapper'
import {
	VALUE,
	PROVIDER,
	CONSTRUCTOR,
	SINGLETON,
	FUNCTION,
	INSTANCE,
	TRANSIENT,
	LAZY,
	EAGER
} from './options'

const factories = {
	[ generateMask([VALUE]) ]: createSimpleMappingFactory(identity),
	[ generateMask([FUNCTION]) ]: createSimpleMappingFactory(partial),
	[ generateMask([CONSTRUCTOR]) ]: createSimpleMappingFactory(instanciate),
	[ generateMask([PROVIDER]) ]: createSimpleMappingFactory(invoke),

	[ generateMask([TRANSIENT, SINGLETON, PROVIDER]) ]: createSingletonMappingFactory(invoke, true),
	[ generateMask([TRANSIENT, CONSTRUCTOR, SINGLETON]) ]: createSingletonMappingFactory(instanciate, true),

	[ generateMask([LAZY, SINGLETON, PROVIDER]) ]: createSingletonMappingFactory(invoke),
	[ generateMask([LAZY, SINGLETON, CONSTRUCTOR]) ]: createSingletonMappingFactory(instanciate),

	[ generateMask([EAGER, SINGLETON, PROVIDER])]: createSingletonMappingFactory(invoke),
	[ generateMask([EAGER, SINGLETON, CONSTRUCTOR]) ]: createSingletonMappingFactory(instanciate)
}

// aliases
factories[ generateMask([INSTANCE]) ] = factories[ generateMask([VALUE]) ]

export default function createMapping(type, value, resolveDeps, releaseDeps) {
	if ( !(type in factories) ) {
		throw new Error('Invalid flags combination. See documentation for valid flags combinations.')
	}
	return createPropertyMapper(factories[type], value, resolveDeps, releaseDeps)
}
