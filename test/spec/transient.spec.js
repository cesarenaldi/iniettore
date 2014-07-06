'use strict'

import iniettore from '../../src/iniettore'
import { PROVIDER, VALUE } from '../../src/options'

describe('Given a container with a registered provider', function () {

	var providerSpy = sinon.spy()
	var container

	describe('when requesting it with some transient dependencies ', function () {

		var TRANSIENT_DEPENDENCIES = {
			baz: 84
		}

		before(function () {
			container = iniettore.create(function (container) {
				container
					.bind('bar', 42).as(VALUE)
					.bind('foo', providerSpy).as(PROVIDER).inject('bar', 'baz')
			})
		})

		beforeEach(function () {
			providerSpy.reset()
		})

		it('should also use them to resolve the final provider dependencies', function () {
			var foo = container.using(TRANSIENT_DEPENDENCIES).get('foo')

			expect(providerSpy).to.be.calledWith(42, 84)
		})

		it('should not leave any transient dependency registered in the container', function () {
			var foo = container.using(TRANSIENT_DEPENDENCIES).get('foo')

			function testCase() {
				container.get('baz')
			}

			expect(testCase).to.throw(Error)
		})
	})
})