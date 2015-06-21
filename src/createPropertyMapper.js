'use strict'

const SUPPORT_CODE_INTROSPECTION = typeof Object.getOwnPropertyDescriptor === 'function'
const hasOwnProperty = Object.prototype.hasOwnProperty;

function lookupForDescriptor(object, propertyName) {
	if (object === null) {
		return undefined
	}
	if (hasOwnProperty.call(object, propertyName)) {
		return Object.getOwnPropertyDescriptor(object, propertyName)
	}
	return lookupForDescriptor(Object.getPrototypeOf(object), propertyName)
}

function createGetter(instance, propertyName) {
	return function () {
		if (arguments.length > 0) {
			throw new Error('You cannot use a property accessor to mutate a read-only property.')
		}
		return instance[propertyName]
	}
}

function createSetter(instance, propertyName) {
	return function (value) {
		if (arguments.length === 0) {
			throw new Error('You cannot use a property mutator to read a write-only property.')
		}
		instance[propertyName] = value
	}
}

function createSetterGetter(instance, propertyName) {
	return function (value) {
		if (arguments.length === 0) {
			return instance[propertyName]
		}
		instance[propertyName] = value
	}
}

function createPropertyProxy(instance, propertyName) {
	if (SUPPORT_CODE_INTROSPECTION) {
		let descriptor = lookupForDescriptor(instance, propertyName)

		if (typeof descriptor.get === 'function' && typeof descriptor.set === 'function') {
			return createSetterGetter(instance, propertyName)
		}
		if (typeof descriptor.get === 'function') {
			return createGetter(instance, propertyName)
		}
		if (typeof descriptor.set === 'function') {
			return createSetter(instance, propertyName)
		}
	}
	return createSetterGetter(instance, propertyName)
}

function extractProperty(instance, propertyName) {
	if (typeof instance[propertyName] === 'function') {
		return instance[propertyName].bind(instance)
	}
	return createPropertyProxy(instance, propertyName)
}

export default function createPropertyMapper(createMapping, ...args) {
	var mapping = createMapping.apply(null, args);

	return Object.create(mapping, {
		get: {
			value: function (propertyName) {
				var instance = mapping.get()

				if (propertyName) {
					return extractProperty(instance, propertyName)
				}
				return instance
			}
		}
	})
}
