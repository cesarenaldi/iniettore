'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, SINGLETON, TRANSIENT } from '../../src/options'


describe('Given a container with a registered constructor', function () {

	describe('when requesting the corresponding alias', function () {

		it('should create a new instance', function (done) {
			class Foo {
				constructor () {
					expect(this).to.be.an.instanceOf(Foo)
					done()
				}
			}

			var container = iniettore.create(function (context) {
				context
					.bind('foo', Foo)
					.as(CONSTRUCTOR)
			})

			container.get('foo')
		})
	})

	describe('marked as singleton', function () {

		describe('when requesting the corresponding alias', function () {

			it('should create an instance at the first request and return it at the subsequent call', function () {

				var idx = 0
				var constructorSpy = sinon.spy()
				var firstGet, secondGet

				class Foo {
					constructor() {
						constructorSpy.call()
						this.id = idx++
					}
				}

				var container = iniettore.create(function (context) {
					context
						.bind('foo', Foo)
						.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
				})

				expect(constructorSpy).to.not.be.called

				firstGet = container.get('foo')

				expect(constructorSpy).to.not.be.calle

				secondGet = container.get('foo')
				expect(secondGet).to.equal(firstGet)
			})
		})

		describe('with some other singleton constructors shared dependencies', function () {

			describe('when requesting the corresponding alias', function () {

				it('should create singletons from the respective constructors', function () {
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
							.bind('common', Common)
							.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
							.bind('bar', Bar)
							.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
							.inject('common')
							.bind('foo', Foo)
							.as(TRANSIENT, SINGLETON, CONSTRUCTOR)
							.inject('common', 'bar')
					})

					expect(container.get('foo')).to.be.instanceof(Foo)
				})
			})
		})
	})
})