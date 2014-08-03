'use strict'

import iniettore from '../../src/iniettore'
import { TRANSIENT, LAZY, PROVIDER, SINGLETON, CONSTRUCTOR, EAGER } from '../../src/options'

describe('Given a LAZY, SINGLETON, CONSTRUCTOR', function () {

	var constructorSpy = sinon.spy()

	class Bar {
		constructor() {
			constructorSpy()
		}
	}

	describe('when registering it into the context', function () {
		it('should not create an instance', function () {

			iniettore.create(function (context) {
				context
					.map('bar')
					.to(Bar)
					.as(LAZY, SINGLETON, CONSTRUCTOR)
			})
			expect(constructorSpy).to.not.be.called
		})
	})

	describe('when requesting the mapping for the first time', function () {
		var container

		before(function () {
			container = iniettore.create(function (context) {
				context
					.map('bar')
					.to(Bar)
					.as(LAZY, SINGLETON, CONSTRUCTOR)
			})
		})

		it('should create an instance', function () {
			container.get('bar')
			expect(constructorSpy).to.be.calledOnce
		})
	})

	describe('when requesting the mapping multiple times', function () {
		var container

		before(function () {
			container = iniettore.create(function (context) {
				context
					.map('bar')
					.to(Bar)
					.as(LAZY, SINGLETON, CONSTRUCTOR)
			})
		})

		it('should return the same instance', function () {
			var bar1 = container.get('bar')
			var bar2 = container.get('bar')
			expect(bar1).to.equal(bar2)
		})
	})

	describe('when invoking container.release with the corresponding mapping name', function () {
		var container

		before(function () {
			container = iniettore.create(function (context) {
				context
					.map('bar')
					.to(Bar)
					.as(LAZY, SINGLETON, CONSTRUCTOR)
			})
		})

		it('should not release the instance', function () {
			var bar1 = container.get('bar')
			container.release('bar')
			var bar2 = container.get('bar')
			expect(bar1).to.equal(bar2)
		})
	})
})

describe('Given a LAZY, SINGLETON, PROVIDER', function () {
	var barProvider = sinon.spy()

	describe('when registering it into the context', function () {
		it('should not invoke the provider function', function () {

			iniettore.create(function (context) {
				context
					.map('bar')
					.to(barProvider)
					.as(LAZY, SINGLETON, PROVIDER)
			})
			expect(barProvider).to.not.be.called
		})
	})

	describe('when requesting the mapping for the first time', function () {
		var container

		before(function () {
			container = iniettore.create(function (context) {
				context
					.map('bar')
					.to(barProvider)
					.as(LAZY, SINGLETON, PROVIDER)
			})
		})

		it('should invoke the provider function', function () {
			container.get('bar')
			expect(barProvider).to.be.calledOnce
		})
	})

	describe('when requesting the mapping multiple times', function () {
		var container
		function barProvider() {
			return {}
		}

		before(function () {
			container = iniettore.create(function (context) {
				context
					.map('bar')
					.to(barProvider)
					.as(LAZY, SINGLETON, PROVIDER)
			})
		})

		it('should return the instance created at the first request', function () {
			var bar1 = container.get('bar')
			var bar2 = container.get('bar')
			expect(bar1).to.equal(bar2)
		})
	})

	describe('when invoking container.release with the corresponding mapping name', function () {
		var container
		function barProvider() {
			return {}
		}

		before(function () {
			container = iniettore.create(function (context) {
				context
					.map('bar')
					.to(barProvider)
					.as(LAZY, SINGLETON, PROVIDER)
			})
		})

		it('should not release the instance', function () {
			var bar1 = container.get('bar')
			container.release('bar')
			var bar2 = container.get('bar')
			expect(bar1).to.equal(bar2)
		})
	})
})