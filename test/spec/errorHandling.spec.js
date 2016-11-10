import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../../src/iniettore'

describe('Given iniettore', function () {
	describe('when creating a new context without a contribution function', function () {
		it('should throw an Error', function () {
			function testCase() {
				iniettore.create()
			}

			expect(testCase).to.throw(Error, /missing contribution function/i)
		})
	})
})

describe('Given a context', function () {

	var rootContext

	describe('when registering a mapping with an invalid options combination', function () {
		it('should throw an Error', function () {
			function testCase() {
				iniettore.create(function (map) {
					map('foo').to({}).as(SINGLETON, VALUE)
				})
			}
			expect(testCase).to.throw(Error, /invalid flags combination/i)
		})
	})

	describe('when requesting an alias that has never registered before', function () {

		before(function () {
			rootContext = iniettore.create(function () {})
		})

		it('should throw an Error', function () {
			function testCase() {
				rootContext.get('pluto')
			}
			expect(testCase).to.throw(Error, '\pluto\' is not available. Has it ever been registered?.')
		})
	})

	describe('with a registered constructor', function () {

		class Foo {
			constructor() {
				throw new Error('Unexpected issue')
			}
		}

		beforeEach(function () {
			rootContext = iniettore.create(function (map) {
				map('foo').to(Foo).as(CONSTRUCTOR)
			})
		})

		describe('when the constructor throw an Error', function () {

			it('should catch it and throw an Error specifing the failing component', function () {
				function testCase() {
					rootContext.get('foo')
				}
				expect(testCase).to.throw(Error, 'Failed while resolving \'foo\' due to:\n\tUnexpected issue')
			})
		})
	})

	describe('with a registered singleton', function () {

		var DUMMY_INSTANCE = { dispose: function () { throw new Error('Unexpected issue') } }
		var providerStub = sinon.stub().returns(DUMMY_INSTANCE)

		beforeEach(function () {
			rootContext = iniettore.create(function (map) {
				map('bar').to(providerStub).as(TRANSIENT, SINGLETON, PROVIDER)
			})
		})

		describe('when the releasing the singleton instance', function () {

			it('should enrich the message of any error the instance dispose method may throw', function () {
				rootContext.get('bar')
				function testCase() {
					rootContext.release('bar')
				}
				expect(testCase).to.throw(Error, 'Failed while releasing \'bar\' due to:\n\tUnexpected issue')
			})
		})

		describe('when disposing the context itself', function () {

			it('should enrich the message of any error the instance dispose method may throw', function () {
				rootContext.get('bar')
				function testCase() {
					rootContext.dispose()
				}
				expect(testCase).to.throw(Error, 'Failed while disposing \'bar\' due to:\n\tUnexpected issue')
			})
		})
	})

	describe('with a circular dependency', function () {

		describe('when requesting the corresponding alias', function () {

			it('should throw an Error', function () {

				class Bar {}

				rootContext = iniettore.create(function (map) {
					map('bar').to(Bar).as(CONSTRUCTOR).injecting('bar')
				})

				function testCase () {
					rootContext.get('bar')
				}
				expect(testCase).to.throw(Error, /Circular dependency/)
			})
		})
	})
})
