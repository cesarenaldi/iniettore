import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../../src/iniettore'

function noop() {}

describe('Given a child context', function () {

	var OBJECT = {}

	describe('when requesting an alias registered in the parent context', function () {
		it('should return the same binding as requested to the parent context', function () {
			var rootContext = iniettore.create(function (map) {
				map('foo').to(OBJECT).as(VALUE)
			})
			var child = rootContext.createChild(noop)

			expect(child.get('foo'))
				.to.equal(rootContext.get('foo'))
		})
	})

	describe('when requesting the reference to the contexts', function () {

		it('should return the respective contexts', function () {
			var rootContext = iniettore.create(noop)
			var child = rootContext.createChild(noop)
			expect(rootContext.get('$context')).to.equal(rootContext)
			expect(child.get('$context')).to.equal(child)
			expect(rootContext.get('$context')).to.not.equal(child.get('$context'))
		})
	})

	describe('with a registered alias that shadows the one registered in the parent context', function () {

		describe('when requesting its alias from the child context', function () {

			var rootContext

			beforeEach(function () {
				rootContext = iniettore.create(function (map) {
					map('foo').to(OBJECT).as(VALUE)
				})
			})

			it('should retrieve the child context version', function () {
				var child = rootContext.createChild(function (map) {
					map('foo').to(42).as(VALUE)
				})
				expect(child.get('foo')).to.equal(42)
				expect(rootContext.get('foo')).to.equal(OBJECT)
			})
		})
	})

	describe('when requesting an instance from a provider registered in the child context', function () {

		describe('with a dependency from a provider registered in the parent context', function () {

			var PARENT_INSTANCE = {}
			var CHILD_INSTANCE = {}
			var parentProviderStub = sinon.stub().returns(PARENT_INSTANCE)
			var chilProviderStub = sinon.stub().returns(CHILD_INSTANCE)
			var rootContext, childContext

			beforeEach(function () {
				rootContext = iniettore.create(function (map) {
					map('bar').to(parentProviderStub).as(TRANSIENT, SINGLETON, PROVIDER)
				})
				childContext = rootContext.createChild(function (map) {
					map('baz').to(chilProviderStub).as(TRANSIENT, SINGLETON, PROVIDER).injecting('bar')
				})
			})

			it('should create singleton instances in the respective contexts', function () {

				var baz = childContext.get('baz')

				expect(baz).to.equal(CHILD_INSTANCE)
				expect(rootContext.get('bar')).to.equal(PARENT_INSTANCE)
			})
		})
	})
})
