'use strict'

import iniettore from '../../src/iniettore'
import {
	VALUE,
	PROVIDER,
	CONSTRUCTOR,
	SINGLETON
} from '../../src/options'


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

	describe('and child container', function () {

		var PARENT_INSTANCE = { dispose: sinon.spy() }
		var CHILD_INSTANCE = { dispose: sinon.spy() }
		var parentProviderStub = sinon.stub().returns(PARENT_INSTANCE)
		var chilProviderStub = sinon.stub().returns(CHILD_INSTANCE)
		var child

		beforeEach(function () {
			child = container.createChild()
			PARENT_INSTANCE.dispose.reset()
				CHILD_INSTANCE.dispose.reset()
		})

		describe('when disposing an instance in the child container', function () {

			describe('with a dependency in the parent container', function () {

				beforeEach(function () {
					container
						.bind('bar', parentProviderStub)
						.as(SINGLETON, PROVIDER)
						.done()
					child
						.bind('baz', chilProviderStub)
						.as(SINGLETON, PROVIDER)
						.inject('bar')
						.done()
					child.get('baz')
				})

				it('should dispose both in the corresponding containers', function (done) {
					child.release('baz')
					expect(CHILD_INSTANCE.dispose).to.be.calledOnce
					expect(PARENT_INSTANCE.dispose).to.be.calledOnce
					done()
				})

				it('should dispose only the child one if the parent one is still in use', function () {
					container.get('bar')
					child.release('baz')
					expect(CHILD_INSTANCE.dispose).to.be.calledOnce
					expect(PARENT_INSTANCE.dispose).to.not.be.called
				})
			})
		})

		describe('when disposing the child container itself', function () {

			beforeEach(function () {
				container
					.bind('bar', parentProviderStub)
					.as(SINGLETON, PROVIDER)
					.done()
				child
					.bind('baz', chilProviderStub)
					.as(SINGLETON, PROVIDER)
					.inject('bar')
					.done()
			})

			it('should dispose the registered singleton instances', function () {
				child.get('baz')
				child.dispose()
				expect(CHILD_INSTANCE.dispose).to.be.calledOnce
				expect(PARENT_INSTANCE.dispose).to.be.calledOnce
			})
		})

		describe.skip('when disposing the parent container', function () {
			it('should dispose the child container as well', function () {
				expect(false).to.be.true
			})
		})
	})

	describe.skip('when disposing the instance outside of the container lifecycle management', function () {
		
		it('should throw an Error', function () {
			
			var instance = container.get('baz')

			function testCase() {
				instance.dispose()
			}
			expect(testCase).to.throw(Error)
		})
	})
})