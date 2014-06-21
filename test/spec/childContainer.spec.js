'use strict'

import iniettore from '../../lib/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON } from '../../lib/options'


describe('Given a child container', function () {

	var parent
	var child

	var OBJECT = {}

	beforeEach(function () {
		parent = iniettore.create()
		child = parent.createChild()
	})

	it('should be possible to request registered value of the parent container', function () {
		parent
			.bind('foo', OBJECT)
			.as(VALUE)
			.done()
		expect(child.get('foo'))
			.to.equal(parent.get('foo'))
	})

	it('should be possible to get the respective containers using the reserved alias `$container`', function () {
		expect(parent.get('$container')).to.equal(parent)
		expect(child.get('$container')).to.equal(child)
		expect(parent.get('$container')).to.not.equal(child.get('$container'))
	})

	describe('with a registered value that shadows the parent one', function () {

		describe('when requesting its alias from the child container', function () {

			beforeEach(function () {
				parent
					.bind('foo', OBJECT)
					.as(VALUE)
					.done()
			})

			it('should retrieve the child container version', function () {
				child
					.bind('foo', 42)
					.as(VALUE)
					.done()
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

			beforeEach(function () {
				parent
					.bind('bar', parentProviderStub)
					.as(SINGLETON, PROVIDER)
					.done()
				child
					.bind('baz', chilProviderStub)
					.as(SINGLETON, PROVIDER)
					.inject('bar')
					.done()
			})

			it('should create instances in the respective containers', function () {

				var baz = child.get('baz')

				expect(baz).to.equal(CHILD_INSTANCE)
				expect(parent.get('bar')).to.equal(PARENT_INSTANCE)
			})
		})
	})

	describe('when disposing an instance in the child container', function () { 
		describe('with a dependency in the parent container', function () {

			var PARENT_INSTANCE = { dispose: sinon.spy() }
			var CHILD_INSTANCE = { dispose: sinon.spy() }
			var parentProviderStub = sinon.stub().returns(PARENT_INSTANCE)
			var chilProviderStub = sinon.stub().returns(CHILD_INSTANCE)

			beforeEach(function () {
				PARENT_INSTANCE.dispose.reset()
				CHILD_INSTANCE.dispose.reset()
				parent
					.bind('bar', parentProviderStub)
					.as(SINGLETON, PROVIDER)
					.done()
				child
					.bind('baz', chilProviderStub)
					.as(SINGLETON, PROVIDER)
					.inject('bar')
					.done()
				child.get('baz')
			})

			it('should dispose both in the corresponding containers', function () {
				child.release('baz')
				expect(CHILD_INSTANCE.dispose).to.be.calledOnce
				expect(PARENT_INSTANCE.dispose).to.be.calledOnce
			})

			it('should dispose only the child one if the parent one is still in use', function () {
				parent.get('bar')
				child.release('baz')
				expect(CHILD_INSTANCE.dispose).to.be.calledOnce
				expect(PARENT_INSTANCE.dispose).to.not.be.called
			})
		})
	})

	describe('when disposing the child container itself', function () {

		var PARENT_INSTANCE = { dispose: sinon.spy() }
		var CHILD_INSTANCE = { dispose: sinon.spy() }
		var parentProviderStub = sinon.stub().returns(PARENT_INSTANCE)
		var chilProviderStub = sinon.stub().returns(CHILD_INSTANCE)

		beforeEach(function () {
			PARENT_INSTANCE.dispose.reset()
			CHILD_INSTANCE.dispose.reset()
			parent
				.bind('bar', parentProviderStub)
				.as(SINGLETON, PROVIDER)
				.done()
			child
				.bind('baz', chilProviderStub)
				.as(SINGLETON, PROVIDER)
				.inject('bar')
				.done()
		})

		it('should dispose the registered singleton instances', function () {
			child.get('baz')
			child.dispose()
			expect(CHILD_INSTANCE.dispose).to.be.calledOnce
			expect(PARENT_INSTANCE.dispose).to.be.calledOnce
		})
	})
})