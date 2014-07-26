'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../../src/options'

function noop() {}

describe('Given a child container', function () {

	var OBJECT = {}

	describe('when requesting an alias registered in the parent container', function () {
		it('should return the same binding as requested to the parent container', function () {
			var parent = iniettore.create(function (context) {
				context
					.map('foo').to(OBJECT)
					.as(VALUE)
			})
			var child = parent.createChild(noop)

			expect(child.get('foo'))
				.to.equal(parent.get('foo'))
		})
	})

	describe('when requesting a reference to the containers themself', function () {


		it('should return the respective containers', function () {
			var parent = iniettore.create(noop)
			var child = parent.createChild(noop)
			expect(parent.get('$container')).to.equal(parent)
			expect(child.get('$container')).to.equal(child)
			expect(parent.get('$container')).to.not.equal(child.get('$container'))
		})
	})

	describe('with a registered alias that shadows the one registered in the parent container', function () {

		describe('when requesting its alias from the child container', function () {

			var parent

			beforeEach(function () {
				parent = iniettore.create(function (context) {
					context
						.map('foo').to(OBJECT)
						.as(VALUE)
				})
			})

			it('should retrieve the child container version', function () {
				var child = parent.createChild(function (context) {
					context
						.map('foo').to(42)
						.as(VALUE)
				})
				expect(child.get('foo')).to.equal(42)
				expect(parent.get('foo')).to.equal(OBJECT)
			})
		})
	})

	describe('when requesting an instance from a provider registered in the child container', function () {

		describe('with a dependency from a provider registered in the parent container', function () {

			var PARENT_INSTANCE = {}
			var CHILD_INSTANCE = {}
			var parentProviderStub = sinon.stub().returns(PARENT_INSTANCE)
			var chilProviderStub = sinon.stub().returns(CHILD_INSTANCE)
			var parent, child

			beforeEach(function () {
				parent = iniettore.create(function (context) {
					context
						.map('bar').to(parentProviderStub)
						.as(TRANSIENT, SINGLETON, PROVIDER)
				})
				child = parent.createChild(function (context) {
					context
						.map('baz').to(chilProviderStub)
						.as(TRANSIENT, SINGLETON, PROVIDER)
						.injecting('bar')
				})
			})

			it('should create instances in the respective containers', function () {

				var baz = child.get('baz')

				expect(baz).to.equal(CHILD_INSTANCE)
				expect(parent.get('bar')).to.equal(PARENT_INSTANCE)
			})
		})
	})
})