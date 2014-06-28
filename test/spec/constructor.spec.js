'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, SINGLETON } from '../../src/options'


describe('Given a container with a registered constructor', function () {

	var container

	beforeEach(function () {
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

		describe('with some extra parameters', function () {

			var EXTRA_PARAM_1 = {}
			var EXTRA_PARAM_2 = {}

			beforeEach(function () {
				container
					.bind('bar', 42)
					.as(VALUE)
					.done()
			})

			it('should create a new instance passing dependencies and extra params', function () {

				class Foo {
					constructor (bar, param1, param2) {
						expect(bar).to.equal(42)
						expect(param1).to.equal(EXTRA_PARAM_1)
						expect(param2).to.equal(EXTRA_PARAM_2)
					}
				}

				container
					.bind('foo', Foo)
					.as(CONSTRUCTOR)
					.inject('bar')
					.done()

				container.get('foo', EXTRA_PARAM_1, EXTRA_PARAM_2)
			})
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

		beforeEach(function () {
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

				class Bar {}

				container
					.bind('bar', Bar)
					.as(CONSTRUCTOR)
					.inject('bar')
					.done()

				function testCase () {
					container.get('bar')
				}
				expect(testCase).to.throw(Error, /Circular dependency/)
			})
		})
	})
})