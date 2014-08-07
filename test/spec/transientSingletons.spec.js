'use strict'

import iniettore from '../../src/iniettore'
import { TRANSIENT, PROVIDER, SINGLETON, CONSTRUCTOR } from '../../src/iniettore'

describe('Given a TRANSIENT, SINGLETON, CONSTRUCTOR mapping', function () {

	describe('when requesting it', function () {

		it('should create an instance at the first request and return it at the subsequent call', function () {
			var constructorSpy = sinon.spy()
			var bar1, bar2

			class Bar {
				constructor() {
					constructorSpy.call()
				}
			}

			var rootContext = iniettore.create(function (map) {
				map('bar').to(Bar).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
			})

			expect(constructorSpy).to.not.be.called

			bar1 = rootContext.get('bar')

			expect(constructorSpy).to.be.calledOnce

			bar2 = rootContext.get('bar')
			expect(bar2).to.equal(bar1)
		})
	})

	describe('with TRANSIENT, SINGLETON, CONSTRUCTOR as shared dependency', function () {

		describe('when requesting it', function () {

			it('should create singleton instances from the respective constructors', function () {
				var commonInstance

				class Common {
					constructor() {
						commonInstance = this
					}
				}

				class Bar {
					constructor(common) {
						expect(common)
							.to.be.instanceof(Common)
							.and.to.equal(commonInstance)
					}
				}

				class Foo {
					constructor(common, bar) {
						expect(common)
							.to.be.instanceof(Common)
							.and.to.equal(commonInstance)
						expect(bar).to.be.instanceof(Bar)
					}
				}

				var rootContext = iniettore.create(function (map) {
					map('common').to(Common).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
					map('bar').to(Bar).as(TRANSIENT, SINGLETON, CONSTRUCTOR).injecting('common')
					map('foo').to(Foo).as(TRANSIENT, SINGLETON, CONSTRUCTOR).injecting('common', 'bar')
				})

				expect(rootContext.get('foo')).to.be.instanceof(Foo)
			})
		})
	})
	
	describe('and an instance of it', function () {
		var rootContext

		describe('when releasing the instance', function () {
			class Bar {}

			beforeEach(function () {
				rootContext = iniettore.create(function (map) {
					map('bar').to(Bar).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
				})
			})

			it('should not release the instance if still in use', function () {
				var bar1 = rootContext.get('bar')
				var bar2 = rootContext.get('bar')
				var bar3

				expect(bar1).to.equal(bar2)

				rootContext.release('bar')

				bar3 = rootContext.get('bar')

				expect(bar3).to.equal(bar1)
			})

			describe('the same amount of times it has been requested', function () {

				it('should release the instance', function () {
					var bar1 = rootContext.get('bar')
					var bar2 = rootContext.get('bar')
					var bar3

					expect(bar1).to.equal(bar2)

					rootContext.release('bar')
					rootContext.release('bar')

					bar3 = rootContext.get('bar')

					expect(bar3).to.not.equal(bar1)
				})
			})
		})
	})
})

describe('Given a TRANSIENT, SINGLETON, PROVIDER mapping', function () {

	describe('when requesting it', function () {

		it('should invoke the provider function at the first request and return the created item at the subsequent call', function () {
			var providerSpy = sinon.spy()
			var fooProvider = function () {
				providerSpy()
				return {}
			}
			var foo1, foo2

			var rootContext = iniettore.create(function (map) {
				map('foo').to(fooProvider).as(TRANSIENT, SINGLETON, PROVIDER)
			})
			expect(providerSpy).to.not.be.called

			foo1 = rootContext.get('foo')

			expect(providerSpy).to.be.calledOnce

			foo2 = rootContext.get('foo')
			expect(foo2).to.equal(foo1)
		})
	})

	describe('and an instance created from it', function () {
		var rootContext

		describe('when releasing the instance', function () {
			function fooProvider() {
				return {}
			}

			beforeEach(function () {
				rootContext = iniettore.create(function (map) {
					map('foo').to(fooProvider).as(TRANSIENT, SINGLETON, PROVIDER)
				})
			})

			it('should not release the instance if still in use', function () {
				var foo1 = rootContext.get('foo')
				var foo2 = rootContext.get('foo')
				var foo3

				expect(foo1).to.equal(foo2)

				rootContext.release('foo')

				foo3 = rootContext.get('foo')

				expect(foo3).to.equal(foo1)
			})

			describe('the same amount of times it has been requested', function () {

				it('should release the instance', function () {
					var foo1 = rootContext.get('foo')
					var foo2 = rootContext.get('foo')
					var foo3

					expect(foo1).to.equal(foo2)

					rootContext.release('foo')
					rootContext.release('foo')

					foo3 = rootContext.get('foo')

					expect(foo3).to.not.equal(foo1)
				})
			})
		})
	})
})