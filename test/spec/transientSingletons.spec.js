'use strict'

import iniettore from '../../src/iniettore'
import { TRANSIENT, PROVIDER, SINGLETON, CONSTRUCTOR } from '../../src/options'

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

			var container = iniettore.create(function (context) {
				context
					.map('bar').to(Bar)
					.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
			})

			expect(constructorSpy).to.not.be.called

			bar1 = container.get('bar')

			expect(constructorSpy).to.be.calledOnce

			bar2 = container.get('bar')
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

				var container = iniettore.create(function (context) {
					context
						.map('common').to(Common)
						.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
						.map('bar').to(Bar)
						.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
						.injecting('common')
						.map('foo').to(Foo)
						.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
						.injecting('common', 'bar')
				})

				expect(container.get('foo')).to.be.instanceof(Foo)
			})
		})
	})
	
	describe('and an instance of it', function () {
		var container

		describe('when releasing the instance', function () {
			class Bar {}

			beforeEach(function () {
				container = iniettore.create(function (context) {
					context
						.map('bar')
						.to(Bar)
						.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
				})
			})

			it('should not release the instance if still in use', function () {
				var bar1 = container.get('bar')
				var bar2 = container.get('bar')
				var bar3

				expect(bar1).to.equal(bar2)

				container.release('bar')

				bar3 = container.get('bar')

				expect(bar3).to.equal(bar1)
			})

			describe('the same amount of times it has been requested', function () {

				it('should release the instance', function () {
					var bar1 = container.get('bar')
					var bar2 = container.get('bar')
					var bar3

					expect(bar1).to.equal(bar2)

					container.release('bar')
					container.release('bar')

					bar3 = container.get('bar')

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

			var container = iniettore.create(function (context) {
				context
					.map('foo').to(fooProvider)
					.as(TRANSIENT, SINGLETON, PROVIDER)
			})
			expect(providerSpy).to.not.be.called

			foo1 = container.get('foo')

			expect(providerSpy).to.be.calledOnce

			foo2 = container.get('foo')
			expect(foo2).to.equal(foo1)
		})
	})

	describe('and an instance created from it', function () {
		var container

		describe('when releasing the instance', function () {
			function fooProvider() {
				return {}
			}

			beforeEach(function () {
				container = iniettore.create(function (context) {
					context
						.map('foo')
						.to(fooProvider)
						.as(TRANSIENT, SINGLETON, PROVIDER)
				})
			})

			it('should not release the instance if still in use', function () {
				var foo1 = container.get('foo')
				var foo2 = container.get('foo')
				var foo3

				expect(foo1).to.equal(foo2)

				container.release('foo')

				foo3 = container.get('foo')

				expect(foo3).to.equal(foo1)
			})

			describe('the same amount of times it has been requested', function () {

				it('should release the instance', function () {
					var foo1 = container.get('foo')
					var foo2 = container.get('foo')
					var foo3

					expect(foo1).to.equal(foo2)

					container.release('foo')
					container.release('foo')

					foo3 = container.get('foo')

					expect(foo3).to.not.equal(foo1)
				})
			})
		})
	})
})