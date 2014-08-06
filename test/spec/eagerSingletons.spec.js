'use strict'

import iniettore from '../../src/iniettore'
import { TRANSIENT, LAZY, PROVIDER, SINGLETON, CONSTRUCTOR, EAGER, VALUE } from '../../src/options'

describe('Given a provider and a contructor', function () {

	var provider = sinon.spy()
	var constructorSpy = sinon.spy()

	class Foo {
		constructor(...args) {
			constructorSpy.apply(null, args)
		}
	}

	beforeEach(function () {
		provider.reset()
		constructorSpy.reset()
	})

	describe('when registering them as EAGER, SINGLETONs', function () {

		it('should create instances straightaway', function () {

			iniettore.create(function (map) {
				map('number').to(42).as(VALUE)
				map('bar').to(provider).as(EAGER, SINGLETON, PROVIDER).injecting('number')
				map('foo').to(Foo).as(EAGER, SINGLETON, CONSTRUCTOR).injecting('number')
			})
			expect(provider).to.be.calledWith(42)
			expect(constructorSpy).to.be.calledWith(42)
		})
	})
})