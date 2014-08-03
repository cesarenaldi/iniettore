'use strict'

import iniettore from '../../src/iniettore'
import {
	VALUE,
	PROVIDER,
	CONSTRUCTOR,
	SINGLETON,
	TRANSIENT,
	LAZY
} from '../../src/options'


describe('Given a container', function () {

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

	describe('when releasing a TRANSIENT, SINGLETON instance', function () {

		beforeEach(function () {
			providerStub = sinon.stub()
			BazDisposeSpy.reset()

			providerStub
				.onFirstCall().returns(BAR_1)
				.onSecondCall().returns(BAR_2)

			container = iniettore.create(function (context) {
				context
					.map('foo').to(OBJECT_DEP)
					.as(VALUE)

					.map('baz').to(Baz)
					.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
					.injecting('foo')

					.map('bar').to(providerStub)
					.as(TRANSIENT, SINGLETON, PROVIDER)
					.injecting('foo', 'baz')
			})

			BAR_1.dispose.reset()
			BAR_2.dispose.reset()
		})

		it('should call instance.dispose() method', function () {

			var bar1 = container.get('bar')
			var bar2 = container.get('bar')

			expect(bar2).to.equal(bar1)

			container.release('bar')
			container.release('bar')

			expect(BAR_1.dispose).to.be.calledOnce
			expect(container.get('bar')).to.not.equal(bar1)
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

		describe('and the instance does not have a dispose method', function () {

			class Foo {}

			beforeEach(function () {
				container = iniettore.create(function (context) {
					context
						.map('foo').to(Foo)
						.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
				})
				container.get('foo')
			})

			it('should not throw an Error', function () {
				function testCase() {
					container.release('foo')
				}
				expect(testCase).to.not.throw(TypeError)
			})
		})
	})

	describe('with a registered TRANSIENT, SINGLETON, CONSTRUCTOR and a TRANSIENT, SINGLETON, PROVIDER', function () {

		class Bar {}
		function dummyProvider() { return {} }

		before(function () {
			container = iniettore.create(function (context) {
				context
					.map('bar').to(Bar)
					.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
				context
					.map('foo').to(dummyProvider)
					.as(TRANSIENT, SINGLETON, PROVIDER)
			})
		})

		describe('and none of the two has been requested before', function () {
			describe('when disposing the container', function () {
				it('should not throw an Error related to dispoding instances that don\'t exists', function () {
					function testCase() {
						container.dispose()
					}
					expect(testCase).to.not.throw(TypeError, /Cannot read property 'dispose' of undefined/i)
				})
			})
		})
	})

	describe('and a child container', function () {

		var INSTANCE_IN_PARENT = { dispose: sinon.spy() }
		var INSTANCE_IN_CHILD = { dispose: sinon.spy() }
		var parentProviderStub = sinon.stub().returns(INSTANCE_IN_PARENT)
		var chilProviderStub = sinon.stub().returns(INSTANCE_IN_CHILD)
		var child

		beforeEach(function () {
			container = iniettore.create(function (context) {
				context
					.map('bar').to(parentProviderStub)
					.as(TRANSIENT, SINGLETON, PROVIDER)
			})
			child = container.createChild(function (context) {
				context
					.map('baz').to(chilProviderStub)
					.as(TRANSIENT, SINGLETON, PROVIDER)
					.injecting('bar')
			})
			INSTANCE_IN_PARENT.dispose.reset()
			INSTANCE_IN_CHILD.dispose.reset()
		})

		describe('when disposing a TRANSIENT, SINGLETON instance in the child container', function () {

			describe('with a dependency in the parent container', function () {

				beforeEach(function () {
					child.get('baz')
				})

				it('should dispose both in the corresponding containers', function (done) {
					child.release('baz')
					expect(INSTANCE_IN_CHILD.dispose).to.be.calledOnce
					expect(INSTANCE_IN_PARENT.dispose).to.be.calledOnce
					done()
				})

				it('should dispose only the child one if the parent one is still in use', function () {
					container.get('bar')
					child.release('baz')
					expect(INSTANCE_IN_CHILD.dispose).to.be.calledOnce
					expect(INSTANCE_IN_PARENT.dispose).to.not.be.called
				})
			})
		})

		describe('when disposing the child container', function () {

			it('should dispose the registered TRANSIENT; SINGLETON instances in the respective containers', function () {
				child.get('baz')
				child.dispose()
				expect(INSTANCE_IN_CHILD.dispose).to.be.calledOnce
				expect(INSTANCE_IN_PARENT.dispose).to.be.calledOnce
			})
		})

		describe('when disposing the parent container', function () {

			beforeEach(function () {
				sinon.spy(child, 'dispose')
				child.dispose.reset()
			})

			after(function () {
				child.dispose.restore()
			})

			it('should dispose the child container as well', function () {
				container.dispose()
				expect(child.dispose).to.be.calledOnce
			})

			it('should dispose SINGLETON instances in the child container before moving to dispose the ones in the parent container', function () {
				child.get('bar') // request bar to avoid auto-dispose when disposing child container and its instances
				child.get('baz')
				container.dispose()
				expect(INSTANCE_IN_PARENT.dispose)
					.to.be.calledOnce
				expect(INSTANCE_IN_CHILD.dispose)
					.to.be.calledOnce
					.and.to.be.calledBefore(INSTANCE_IN_PARENT.dispose)
			})

			describe('after having disposed a child container', function () {
				it('should not call the child dispose method', function () {
					child.dispose()
					child.dispose.reset()
					container.dispose()
					expect(child.dispose).to.not.be.called
				})
			})
		})
	})
})