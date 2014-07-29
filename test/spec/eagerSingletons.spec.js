'use strict'

import iniettore from '../../src/iniettore'
import { TRANSIENT, PERSISTENT, PROVIDER, SINGLETON, CONSTRUCTOR, EAGER } from '../../src/options'

describe('Given a provider and a contructor', function () {

	var provider = sinon.spy()
	var constructorSpy = sinon.spy()

	class Foo {
		constructor(...args) {
			constructorSpy.apply(null, args)
		}
	}

	beforeEach(function () {
		provider.reset()
		constructorSpy.reset()
	})

	describe('when registering them as EAGER, SINGLETONs', function () {

		it('should create instances straightaway', function () {

			iniettore.create(function (context) {
				context
					.map('bar')
					.to(provider)
					.as(EAGER, SINGLETON, PROVIDER)

					.map('foo')
					.to(Foo)
					.as(EAGER, SINGLETON, CONSTRUCTOR)
			})
			expect(provider).to.be.calledOnce
			expect(constructorSpy).to.be.calledOnce
		})

		describe('and $context as dependency', function () {

			var context = sinon.match.object.and(sinon.match.has('map', sinon.match.func))

			it('should provide a reference to the context', function () {
				iniettore.create(function (context) {
					context
						.map('bar')
						.to(provider)
						.as(EAGER, SINGLETON, PROVIDER)
						.injecting('$context')

						.map('foo')
						.to(Foo)
						.as(EAGER, SINGLETON, CONSTRUCTOR)
						.injecting('$context')
				})
				expect(provider)
					.to.be.calledOnce
					.and.to.be.calledWith(context)
				expect(constructorSpy)
					.to.be.calledOnce
					.and.to.be.calledWith(context)
			})
		})
	})

	describe('registered as simple CONSTRUCTOR and PROVIDER (not singleton)', function () {
		var container

		describe('with $context as dependency', function () {

			before(function () {
				container = iniettore.create(function (context) {
					context
						.map('bar')
						.to(provider)
						.as(TRANSIENT, SINGLETON, PROVIDER)
						.injecting('$context')

						.map('foo')
						.to(Foo)
						.as(PERSISTENT, SINGLETON, CONSTRUCTOR)
						.injecting('$context')
				})
			})
			describe('when requesting those', function () {
				it('should throw an Error specifying that $context injection is available only for eager singletons', function () {
					function testCase1() {
						container.get('foo')
					}
					function testCase2() {
						container.get('bar')
					}
					expect(testCase1).to.throw(Error)
					expect(testCase2).to.throw(Error)
				})
			})
		})
	})
})