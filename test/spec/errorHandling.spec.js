'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON } from '../../src/options'

describe('Given a container', function () {

	var container

	beforeEach(function () {
		container = iniettore.create()
	})

	describe('with a registered constructor', function () {

		class Foo {
			constructor() {
				throw new Error('Unexpected issue')
			}
		}

		beforeEach(function () {
			container
				.bind('foo', Foo)
				.as(CONSTRUCTOR)
				.done()
		})

		describe('when the constructor throw an Error', function () {

			it('should catch it and throw an Error specifing the failing component', function () {
				function testCase() {
					container.get('foo')
				}
				expect(testCase).to.throw(Error, 'Failed while resolving \'foo\' due to:\n\tUnexpected issue')
			})
		})
	})

	describe('with a registered singleton', function () {

		var DUMMY_INSTANCE = { dispose: function () { throw new Error('Unexpected issue') } }
		var providerStub = sinon.stub().returns(DUMMY_INSTANCE)

		beforeEach(function () {
			container
				.bind('bar', providerStub)
				.as(SINGLETON, PROVIDER)
				.done()
		})

		describe('when disposing and instance it throws an Error', function () {

			it('should catch it and throw an Error specifing the failing component', function () {
				container.get('bar')
				function testCase() {
					container.release('bar')
				}
				expect(testCase).to.throw(Error, 'Failed while disposing \'bar\' due to:\n\tUnexpected issue')
			})
		})

		describe('when disposing the container itself', function () {

			it('should catch it and throw an Error specifing the failing component', function () {
				container.get('bar')
				function testCase() {
					container.dispose()
				}
				expect(testCase).to.throw(Error, 'Failed while disposing \'bar\' due to:\n\tUnexpected issue')
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