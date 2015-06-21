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

var factories = {}

factories[ generateMask([VALUE]) ] = createSimpleMappingFactory(identity)
factories[ generateMask([FUNCTION]) ] = createSimpleMappingFactory(partial)
factories[ generateMask([CONSTRUCTOR]) ] = createSimpleMappingFactory(instanciate)
factories[ generateMask([PROVIDER]) ] = createSimpleMappingFactory(invoke)

factories[ generateMask([TRANSIENT, SINGLETON, PROVIDER]) ] = createSingletonMappingFactory(invoke, true)
factories[ generateMask([TRANSIENT, CONSTRUCTOR, SINGLETON]) ] = createSingletonMappingFactory(instanciate, true)

factories[ generateMask([LAZY, SINGLETON, PROVIDER]) ] = createSingletonMappingFactory(invoke)
factories[ generateMask([LAZY, SINGLETON, CONSTRUCTOR]) ] = createSingletonMappingFactory(instanciate)

factories[ generateMask([EAGER, SINGLETON, PROVIDER])] = createSingletonMappingFactory(invoke)
factories[ generateMask([EAGER, SINGLETON, CONSTRUCTOR]) ] = createSingletonMappingFactory(instanciate)

// aliases
factories[ generateMask([INSTANCE]) ] = factories[ generateMask([VALUE]) ]

export default function createMapping(type, value, resolveDeps, releaseDeps) {
	if ( !(type in factories) ) {
		throw new Error('Invalid flags combination. See documentation for valid flags combinations.')
	}
	return createPropertyMapper(factories[type], value, resolveDeps, releaseDeps)
}
