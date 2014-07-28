'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, EAGER } from '../../src/options'

var bar = sinon.spy()
var Foo = sinon.spy()

describe('Given a provider and a contructor', function () {

	describe('when registering them as EAGER, SINGLETONs', function () {

		it('should create instances straightaway', function () {
			iniettore.create(function (context) {
				context
					.map('bar')
					.to(bar)
					.as(EAGER, SINGLETON, PROVIDER)

					.map('foo')
					.to(Foo)
					.as(EAGER, SINGLETON, CONSTRUCTOR)
			})
			expect(bar).to.be.calledOnce
			expect(Foo).to.be.calledOnce
		})
	})
})