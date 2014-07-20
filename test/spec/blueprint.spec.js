'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../../src/options'

describe('Given a container', function () {

	var VALUE_A = { value: 'a'}
	var parentProvideStub = sinon.stub().returns(42)
	var container

	before(function () {
		container = iniettore.create(function (context) {
			context
				.bind('bar', VALUE_A).as(VALUE)
				.bind('pluto', parentProvideStub).as(TRANSIENT, SINGLETON, PROVIDER)
		})
	})

	describe('and a registered blueprint with some registered bindings', function () {

		var blueprintProviderStub = sinon.stub().returns(84)

		describe('when requesting a copy of the blueprint', function () {

			before(function () {
				container.createBlueprint('foo', function (context) {
					context
						.bind('baz', blueprintProviderStub)
						.as(TRANSIENT, SINGLETON, PROVIDER)
						.inject('bar')
				}).done()
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
				container.createBlueprint('foo', function (context) {

					context
						.bind('baz', blueprintProviderStub)
						.as(TRANSIENT, SINGLETON, PROVIDER)
						.inject('bar')

				}).exports('baz').done()
			})

			describe('when requesting a copy of the blueprint', function () {

				it('should return an instance of the export', function () {
					expect(container.get('foo')).to.equal(84)
				})
			})
		})
	})
})