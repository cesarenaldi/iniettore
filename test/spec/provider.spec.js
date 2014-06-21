'use strict'

import iniettore from '../../lib/iniettore'
import {
	VALUE,
	PROVIDER,
	SINGLETON
} from '../../lib/options'


describe('Given a container with a registered provider', function () {

	var container

	var BAR_1 = { bar: 1, dispose: sinon.spy() }
	var BAR_2 = { bar: 2, dispose: sinon.spy() }

	beforeEach(function () {
		container = iniettore.create()
		container.bind('foo', 42).as(VALUE).done()
	})

	describe('when requesting multiple times the corresponding alias', function () {

		var providerStub = sinon.stub()

		before(function () {
			providerStub
				.onFirstCall().returns(BAR_1)
				.onSecondCall().returns(BAR_2)
		})

		it('should invoke the provider at every request with his dependencies', function () {
			
			var result

			container
				.bind('bar', providerStub)
				.as(PROVIDER)
				.inject('foo')
				.done()

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

	describe('marked as singleton provider', function () {

		var providerStub

		beforeEach(function () {
			providerStub = sinon.stub()
			providerStub
				.onFirstCall().returns(BAR_1)
				.onSecondCall().returns(BAR_2)
			container
				.bind('bar', providerStub)
				.as(SINGLETON, PROVIDER)
				.inject('foo')
				.done()
			BAR_1.dispose.reset()
			BAR_2.dispose.reset()
		})

		describe('when requesting the corresponding alias', function () {

			it('should invoke the provider at the first request and return the created item at the subsequent call', function () {

				var result

				result = container.get('bar')

				expect(result).to.equal(BAR_1)

				result = container.get('bar')

				expect(result).to.equal(BAR_1)
				expect(providerStub)
					.to.be.calledOnce
					.and.to.be.calledWith(42)
			})
		})
	})
})