'use strict'

import iniettore from '../../lib/iniettore'
import { VALUE, CONSTRUCTOR, SINGLETON } from '../../lib/options'


describe('Given a container with a registered constructor', function () {

	var container

	before(function () {
		container = iniettore.create()
	})

	describe('when requesting the corresponding alias', function () {

		it('should create a new instance', function (done) {
			class Foo {
				constructor () {
					expect(this).to.be.an.instanceOf(Foo)
					done()
				}
			}

			container
				.bind('foo', Foo)
				.as(CONSTRUCTOR)
				.done()

			container.get('foo')
		})
	})

	describe('marked as singleton', function () {

		var container = iniettore.create()

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

				container
					.bind('foo', Foo)
					.as(SINGLETON, CONSTRUCTOR)
					.done()

				expect(constructorSpy).to.not.be.called

				firstGet = container.get('foo')

				expect(constructorSpy).to.not.be.calleOnce

				secondGet = container.get('foo')
				expect(secondGet).to.equal(firstGet)
			})
		})
	})

	describe('with dependencies', function () {

		var container

		before(function () {
			container = iniettore.create()
			container.bind('foo', 42).as(VALUE).done()
		})

		describe('when requesting the corresponding alias', function () {

			it('should create a new instance providing the requested dependencies', function () {
				class Bar {
					constructor (foo) {
						expect(this).to.be.an.instanceOf(Bar)
						expect(foo).to.equal(42)
					}

					static baz () {}
				}

				container
					.bind('bar', Bar)
					.as(CONSTRUCTOR)
					.inject('foo')
					.done()

				var bar = container.get('bar')
				expect(bar).to.be.an.instanceOf(Bar)
				expect(bar.constructor.baz).to.deep.equal(Bar.baz)
			})
		})
	})

	describe('with a circular dependency', function () {

		describe('when requesting the corresponding alias', function () {

			it('should throw an Error', function () {

				var container = iniettore.create()

				class Bar {}

				container
					.bind('bar', Bar)
					.as(CONSTRUCTOR)
					.inject('bar')
					.done()

				function testCase () {
					container.get('bar')
				}
				expect(testCase).to.throw(Error)
			})
		})
	})
})