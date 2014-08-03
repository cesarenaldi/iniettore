'use strict'

import iniettore from '../../src/iniettore'
import {
	VALUE,
	PROVIDER,
	SINGLETON,
	TRANSIENT
} from '../../src/options'


describe('Given a container with a registered provider', function () {

	var container

	var BAR_1 = { bar: 1, dispose: sinon.spy() }
	var BAR_2 = { bar: 2, dispose: sinon.spy() }
	var providerStub = sinon.stub()

	beforeEach(function () {
		providerStub.reset()
		providerStub
			.onFirstCall().returns(BAR_1)
			.onSecondCall().returns(BAR_2)
		BAR_1.dispose.reset()
		BAR_2.dispose.reset()
	})

	describe('when requesting multiple times the corresponding alias', function () {

		it('should invoke the provider function at every request with his dependencies', function () {
			
			var result

			container = iniettore.create(function (context) {
				context
					.map('foo').to(42).as(VALUE)

					.map('bar').to(providerStub)
					.as(PROVIDER)
					.injecting('foo')
			})

			result = container.get('bar')

			expect(result).to.equal(BAR_1)
			expect(providerStub)
				.to.be.calledOnce
				.to.be.calledWith(42)

			result = container.get('bar')

			expect(result).to.equal(BAR_2)
			expect(providerStub)
				.to.be.calledTwice
					.and.to.be.calledWith(42)
		})
	})
})