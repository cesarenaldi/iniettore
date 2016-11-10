import iniettore from '../../src/iniettore'
import {
	CONSTRUCTOR,
	EAGER,
	INSTANCE,
	LAZY,
	PROVIDER,
	SINGLETON,
	TRANSIENT,
	VALUE
} from '../../src/iniettore'


describe('Given a context', function () {

	var rootContext, providerStub
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

			rootContext = iniettore.create(function (map) {
				map('foo').to(OBJECT_DEP).as(VALUE)
				map('baz').to(Baz).as(TRANSIENT, SINGLETON, CONSTRUCTOR).injecting('foo')
				map('bar').to(providerStub).as(TRANSIENT, SINGLETON, PROVIDER).injecting('foo', 'baz')
			})

			BAR_1.dispose.reset()
			BAR_2.dispose.reset()
		})

		it('should call instance.dispose() method', function () {

			var bar1 = rootContext.get('bar')
			var bar2 = rootContext.get('bar')

			expect(bar2).to.equal(bar1)

			rootContext.release('bar')
			rootContext.release('bar')

			expect(BAR_1.dispose).to.be.calledOnce
			expect(rootContext.get('bar')).to.not.equal(bar1)
		})

		it('should release all the singleton dependencies', function () {

			var bar = rootContext.get('bar')

			rootContext.release('bar')

			expect(BAR_1.dispose).to.be.calledOnce
			expect(BazDisposeSpy).to.be.calledOnce
		})

		it('should not call dispose for dependencies that are still in use', function () {

			var bar = rootContext.get('bar')

			rootContext.get('baz')
			rootContext.release('bar')

			expect(BazDisposeSpy).to.not.be.called
		})

		it('should not call dispose for any non singleton dependencies', function () {

			var bar = rootContext.get('bar')

			rootContext.get('baz')
			rootContext.release('bar')

			expect(OBJECT_DEP.dispose).to.not.be.called
		})

		describe('and the instance does not have a dispose method', function () {

			class Foo {}

			beforeEach(function () {
				rootContext = iniettore.create(function (map) {
					map('foo').to(Foo).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
				})
				rootContext.get('foo')
			})

			it('should not throw an Error', function () {
				function testCase() {
					rootContext.release('foo')
				}
				expect(testCase).to.not.throw(TypeError)
			})
		})
	})

	describe('with a singleton with a dependency', function () {
		describe('when disposing the context', function () {
			it('should dispose all the disposable instances without throwing an error', function () {
				const instanceA = { dispose: sinon.spy() }
				const instanceB = { dispose: sinon.spy() }
				function aProvider() { return instanceA }
				function bProvider(instanceA) { return instanceB }

				rootContext = iniettore
					.create(function (map) {
						map('instanceA').to(aProvider).as(LAZY, SINGLETON, PROVIDER)
						map('instanceB').to(bProvider).as(EAGER, SINGLETON, PROVIDER).injecting('instanceA')
					})
					.dispose();

				expect(instanceA.dispose).to.be.calledOnce;
				expect(instanceB.dispose).to.be.calledOnce;
			})
		})
	})

	describe('with a registered TRANSIENT, SINGLETON, CONSTRUCTOR and a TRANSIENT, SINGLETON, PROVIDER', function () {

		class Bar {}
		function dummyProvider() { return {} }

		before(function () {
			rootContext = iniettore.create(function (map) {
				map('bar').to(Bar).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
				map('foo').to(dummyProvider).as(TRANSIENT, SINGLETON, PROVIDER)
			})
		})

		describe('and none of the two has been requested before', function () {
			describe('when disposing the context', function () {
				it('should not throw an Error related to dispoding instances that don\'t exists', function () {
					function testCase() {
						rootContext.dispose()
					}
					expect(testCase).to.not.throw(TypeError, /Cannot read property 'dispose' of undefined/i)
				})
			})
		})
	})

	describe('and a child context', function () {

		var INSTANCE_IN_PARENT = { dispose: sinon.spy() }
		var INSTANCE_IN_CHILD = { dispose: sinon.spy() }
		var parentProviderStub = sinon.stub().returns(INSTANCE_IN_PARENT)
		var chilProviderStub = sinon.stub().returns(INSTANCE_IN_CHILD)
		var childContext

		beforeEach(function () {
			rootContext = iniettore.create(function (map) {
				map('bar').to(parentProviderStub).as(TRANSIENT, SINGLETON, PROVIDER)
			})
			childContext = rootContext.createChild(function (map) {
				map('baz').to(chilProviderStub).as(TRANSIENT, SINGLETON, PROVIDER).injecting('bar')
			})
			INSTANCE_IN_PARENT.dispose.reset()
			INSTANCE_IN_CHILD.dispose.reset()
		})

		describe('when disposing a TRANSIENT, SINGLETON instance in the child context', function () {

			describe('with a dependency in the parent context', function () {

				beforeEach(function () {
					childContext.get('baz')
				})

				it('should dispose both in the corresponding contexts', function (done) {
					childContext.release('baz')
					expect(INSTANCE_IN_CHILD.dispose).to.be.calledOnce
					expect(INSTANCE_IN_PARENT.dispose).to.be.calledOnce
					done()
				})

				it('should dispose only the child one if the parent one is still in use', function () {
					rootContext.get('bar')
					childContext.release('baz')
					expect(INSTANCE_IN_CHILD.dispose).to.be.calledOnce
					expect(INSTANCE_IN_PARENT.dispose).to.not.be.called
				})
			})
		})

		describe('when disposing the child context', function () {

			it('should dispose the registered TRANSIENT; SINGLETON instances in the respective contexts', function () {
				childContext.get('baz')
				childContext.dispose()
				expect(INSTANCE_IN_CHILD.dispose).to.be.calledOnce
				expect(INSTANCE_IN_PARENT.dispose).to.be.calledOnce
			})
		})

		describe('when disposing the parent context', function () {

			beforeEach(function () {
				sinon.spy(childContext, 'dispose')
				childContext.dispose.reset()
			})

			after(function () {
				childContext.dispose.restore()
			})

			it('should dispose the child context as well', function () {
				rootContext.dispose()
				expect(childContext.dispose).to.be.calledOnce
			})

			it('should dispose SINGLETON instances in the child context before moving to dispose the ones in the parent context', function () {
				childContext.get('bar') // request bar to avoid auto-dispose when disposing child context and its instances
				childContext.get('baz')
				rootContext.dispose()
				expect(INSTANCE_IN_PARENT.dispose)
					.to.be.calledOnce
				expect(INSTANCE_IN_CHILD.dispose)
					.to.be.calledOnce
					.and.to.be.calledBefore(INSTANCE_IN_PARENT.dispose)
			})

			describe('after having disposed a child context', function () {
				it('should not call the child dispose method', function () {
					childContext.dispose()
					childContext.dispose.reset()
					rootContext.dispose()
					expect(childContext.dispose).to.not.be.called
				})
			})
		})
	})
})
