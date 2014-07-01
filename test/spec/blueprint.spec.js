'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON } from '../../src/options'

describe('Given a container', function () {

	var VALUE_A = { value: 'a'}
	var parentProvideStub = sinon.stub().returns(42)
	var container

	beforeEach(function () {
		container = iniettore.create()
			.bind('bar', VALUE_A).as(VALUE)
			.bind('pluto', parentProvideStub).as(SINGLETON, PROVIDER)
			.done()
	})

	describe('and a registered blueprint with some registered bindings', function () {

		var blueprintProviderStub = sinon.stub().returns(84)

		beforeEach(function () {
			container.createBlueprint('foo', function (container) {

				container
					.bind('baz', blueprintProviderStub)
					.as(SINGLETON, PROVIDER)
					.inject('bar')
					.done()
			})
		})

		describe('when requesting a copy of the blueprint', function () {

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
		})

		describe('when requesting a copy of the blueprint multiple times', function () {
			it('should create a new child container each time', function () {
				var first = container.get('foo')
				var second = container.get('foo')

				expect(first).to.not.equal(second)
			})
		})
	})
})