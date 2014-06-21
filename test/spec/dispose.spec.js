'use strict'

import iniettore from '../../lib/iniettore'
import {
	VALUE,
	PROVIDER,
	CONSTRUCTOR,
	SINGLETON
} from '../../lib/options'


describe('Given a container with registered providers and constructor', function () {

	var container, providerStub
	var BazDisposeSpy = sinon.spy()

	var BAR_1 = { bar: 1, dispose: sinon.spy() }
	var BAR_2 = { bar: 2, dispose: sinon.spy() }
	var OBJECT_DEP = {
		dispose: sinon.spy()
	}

	class Baz {
		dispose() {
			BazDisposeSpy()
		}
	}

	beforeEach(function () {

		container = iniettore.create()

		providerStub = sinon.stub()
		BazDisposeSpy.reset()

		providerStub
			.onFirstCall().returns(BAR_1)
			.onSecondCall().returns(BAR_2)

		container
			.bind('foo', OBJECT_DEP)
			.as(VALUE)
			.done()
		container
			.bind('baz', Baz)
			.as(SINGLETON, CONSTRUCTOR)
			.inject('foo')
			.done()
		container
			.bind('bar', providerStub)
			.as(SINGLETON, PROVIDER)
			.inject('foo', 'baz')
			.done()

		BAR_1.dispose.reset()
		BAR_2.dispose.reset()
	})

	describe('when releasing a singleton', function () {

		it('should not release the instance if still in use', function () {
			var firstRequest = container.get('bar')
			var secondRequest = container.get('bar')

			expect(secondRequest).to.equal(firstRequest)

			container.release('bar')

			expect(BAR_1.dispose).to.not.be.called

			expect(container.get('bar')).to.equal(firstRequest)
		})

		describe('the same amount of times it has been acquired', function () {

			it('should release the instance, call dispose() method', function () {

				var firstRequest = container.get('bar')
				var secondRequest = container.get('bar')

				expect(secondRequest).to.equal(firstRequest)

				container.release('bar')
				container.release('bar')

				expect(BAR_1.dispose).to.be.calledOnce
				expect(container.get('bar')).to.not.equal(firstRequest)
			})

			it('should release all the singleton dependencies', function () {

				var bar = container.get('bar')

				container.release('bar')

				expect(BAR_1.dispose).to.be.calledOnce
				expect(BazDisposeSpy).to.be.calledOnce
			})

			it('should not call dispose for dependencies that are still in use', function () {

				var bar = container.get('bar')

				container.get('baz')
				container.release('bar')

				expect(BazDisposeSpy).to.not.be.called
			})

			it('should not call dispose for any non singleton dependencies', function () {
				
				var bar = container.get('bar')

				container.get('baz')
				container.release('bar')

				expect(OBJECT_DEP.dispose).to.not.be.called
			})
		})
	})
})