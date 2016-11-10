import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT, BLUEPRINT } from '../../src/iniettore'

describe('Given a context', function () {

	var VALUE_A = { value: 'a'}
	var parentProvideStub = sinon.stub().returns(42)
	var rootContext

	describe('and a registered blueprint with some registered mappings', function () {

		var blueprintProviderStub = sinon.stub().returns(84)

		describe('when requesting a copy of the blueprint', function () {

			before(function () {
				function configureChildContext(map) {
					map('baz').to(blueprintProviderStub).as(TRANSIENT, SINGLETON, PROVIDER).injecting('bar')
				}

				rootContext = iniettore.create(function (map) {
					map('bar').to(VALUE_A).as(VALUE)
					map('foo').to(configureChildContext).as(BLUEPRINT)
					map('pluto').to(parentProvideStub).as(TRANSIENT, SINGLETON, PROVIDER)
				})
			})

			it('should create a child context', function () {
				var childContext = rootContext.get('foo')

				expect(childContext).to.respondTo('get')
				expect(childContext.get('bar')).to.equal(VALUE_A)
				expect(childContext.get('baz')).to.equal(84)
				expect(childContext.get('baz')).to.equal(84)
				expect(blueprintProviderStub)
					.to.be.calledOnce
					.and.to.be.calledWith(VALUE_A)
			})

			describe('multiple times', function () {
				it('should create a new child context each time', function () {
					var childContext1 = rootContext.get('foo')
					var childContext2 = rootContext.get('foo')

					expect(childContext1).to.not.equal(childContext2)
				})
			})
		})

		describe('and a specified export alias', function () {

			before(function () {
				function configureChildContext(map) {
			map('baz').to(blueprintProviderStub).as(TRANSIENT, SINGLETON, PROVIDER).injecting('bar')
				}

				rootContext = iniettore.create(function (map) {
					map('bar').to(VALUE_A).as(VALUE)
					map('foo').to(configureChildContext).as(BLUEPRINT).exports('baz')
					map('pluto').to(parentProvideStub).as(TRANSIENT, SINGLETON, PROVIDER)
				})
			})

			describe('when requesting a copy of the blueprint', function () {
				it('should return an instance of the export alias', function () {
					expect(rootContext.get('foo')).to.equal(84)
				})
			})
		})
	})
})
