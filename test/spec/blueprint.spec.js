'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT, BLUEPRINT } from '../../src/options'

describe('Given a container', function () {

	var VALUE_A = { value: 'a'}
	var parentProvideStub = sinon.stub().returns(42)
	var container

	describe('and a registered blueprint with some registered bindings', function () {

		var blueprintProviderStub = sinon.stub().returns(84)

		describe('when requesting a copy of the blueprint', function () {

			before(function () {
				function configureChildContext(context) {
					context
						.map('baz').to(blueprintProviderStub)
						.as(TRANSIENT, SINGLETON, PROVIDER)
						.injecting('bar')
				}

				container = iniettore.create(function (context) {
					context
						.map('bar').to(VALUE_A).as(VALUE)
						.map('foo').to(configureChildContext).as(BLUEPRINT)
						.map('pluto').to(parentProvideStub).as(TRANSIENT, SINGLETON, PROVIDER)
				})
			})

			it('should create a child container', function () {
				var child = container.get('foo')

				expect(child).to.respondTo('get')
				expect(child.get('bar')).to.equal(VALUE_A)
				expect(child.get('baz')).to.equal(84)
				expect(child.get('baz')).to.equal(84)
				expect(blueprintProviderStub)
					.to.be.calledOnce
					.and.to.be.calledWith(VALUE_A)
			})

			describe('multiple times', function () {
				it('should create a new child container each time', function () {
					var first = container.get('foo')
					var second = container.get('foo')

					expect(first).to.not.equal(second)
				})
			})
		})

		describe('and a specified export', function () {

			before(function () {
				function configureChildContext(context) {
					context
						.map('baz').to(blueprintProviderStub)
						.as(TRANSIENT, SINGLETON, PROVIDER)
						.injecting('bar')
				}

				container = iniettore.create(function (context) {
					context
						.map('bar').to(VALUE_A).as(VALUE)
						.map('foo').to(configureChildContext).as(BLUEPRINT).exports('baz')
						.map('pluto').to(parentProvideStub).as(TRANSIENT, SINGLETON, PROVIDER)
				})
			})

			describe('when requesting a copy of the blueprint', function () {

				it('should return an instance of the export', function () {
					expect(container.get('foo')).to.equal(84)
				})
			})
		})
	})
})