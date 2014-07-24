'use strict'

import iniettore from '../../src/iniettore'
import { FUNCTION, VALUE } from '../../src/options'

describe('Given a container with a registered function', function () {

	var container

	describe('when the function has some dependencies', function () {

		var BAR = {}

		it('should return a partial application of the function', function () {
			var foo = function (bar, param1) {
				expect(bar).to.equal(BAR)
				expect(param1).to.equal(42)
			}

			container = iniettore.create(function (context) {
				context
					.map('bar').to(BAR).as(VALUE)
					.map('foo').to(foo).as(FUNCTION).injecting('bar')
			})

			foo = container.get('foo')

			foo(42)
		})
	})
})