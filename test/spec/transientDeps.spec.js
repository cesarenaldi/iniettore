'use strict'

import iniettore from '../../src/iniettore'
import { PROVIDER, VALUE } from '../../src/options'

describe('Given a context with a registered provider', function () {

	var providerSpy = sinon.spy()
	var rootContext

	describe('when requesting it with some transient dependencies ', function () {

		var TRANSIENT_DEPENDENCIES = {
			baz: 84
		}

		before(function () {
			rootContext = iniettore.create(function (map) {
				map('bar').to(42).as(VALUE)
				map('foo').to(providerSpy).as(PROVIDER).injecting('bar', 'baz')
			})
		})

		beforeEach(function () {
			providerSpy.reset()
		})

		it('should also use them to resolve the final provider dependencies', function () {
			var foo = rootContext.using(TRANSIENT_DEPENDENCIES).get('foo')

			expect(providerSpy).to.be.calledWith(42, 84)
		})

		it('should not leave any transient dependency registered in the rootContext', function () {
			var foo = rootContext.using(TRANSIENT_DEPENDENCIES).get('foo')

			function testCase() {
				rootContext.get('baz')
			}

			expect(testCase).to.throw(Error)
		})
	})
})