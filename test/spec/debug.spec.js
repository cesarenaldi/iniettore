import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../../src/iniettore'

describe('Given a context with some registered mappings', function () {

	var rootContext

	class Bar {
		constructor(foo) {
			expect(foo).to.equal(42)
		}
	}

	function provider(bar) {}

	before(function () {
		sinon.stub(console, 'log')
	})

	beforeEach(function () {
		console.log.reset()
	})

	after(function () {
		console.log.restore()
	})

	describe('with no debug option', function () {

		before(function () {
			rootContext = iniettore.create(function (map) {
				map('foo').to(42).as(VALUE)
				map('bar').to(Bar).as(CONSTRUCTOR).injecting('foo')
				map('baz').to(provider).as(PROVIDER).injecting('bar')
			})
		})

		describe('when requesting a mapping', function () {
			it('should not log any information', function () {
				rootContext.get('baz')
				expect(console.log).to.not.be.called
			})
		})
	})

	describe('with the debug option set to true', function () {

		before(function () {
			rootContext = iniettore.create(function (map) {
				map('foo').to(42).as(VALUE)
				map('bar').to(Bar).as(CONSTRUCTOR).injecting('foo')
				map('baz').to(provider).as(PROVIDER).injecting('bar')
			}, { debug: true })
		})

		describe('and process.env.NODE_ENV is different from `production`', function () {

			before(function () {
				process.env.NODE_ENV = 'development'
			})

			describe('when requesting a mapping', function () {
				it('should print log information in a hierarchical way', function () {
					rootContext.get('baz')
					expect(console.log.callCount).to.equal(6)
					expect(console.log.getCall(0).args[0]).to.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Starting resolving 'baz'.../)
					expect(console.log.getCall(1).args[0]).to.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]   Starting resolving 'bar'.../)
					expect(console.log.getCall(2).args[0]).to.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]     Starting resolving 'foo'.../)
					expect(console.log.getCall(3).args[0]).to.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]     Finished resolving 'foo' after \d+ ms/)
					expect(console.log.getCall(4).args[0]).to.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]   Finished resolving 'bar' after \d+ ms/)
					expect(console.log.getCall(5).args[0]).to.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Finished resolving 'baz' after \d+ ms/)
				})
			})
		})

		describe('and process.env.NODE_ENV is set to `production`', function () {

			before(function () {
				process.env.NODE_ENV = 'production'
			})

			describe('when requesting a mapping', function () {
				it('should not log any information', function () {
					rootContext.get('baz')
					expect(console.log).to.not.be.called
				})
			})
		})
	})
})
