'use strict'

import iniettore from '../../src/iniettore'
import { PROVIDER, CONSTRUCTOR, SINGLETON, TRANSIENT } from '../../src/iniettore'

var disposeSpy = sinon.spy()
var callSpy = sinon.stub().returns(42)

class Foo {
	get prop() {
		return callSpy.call(this)
	}
	set prop(value) {
		callSpy.call(this, value)
	}
	get readOnly() {
		return callSpy.call(this)
	}
	set writeOnly(value) {
		callSpy.call(this, value)
	}
	method() {
		return callSpy.call(this)
	}
}

function barProvider() {
	return {
		method() {},
		dispose: disposeSpy
	}
}

var rootContext = iniettore.create(function (map) {
	map('foo').to(Foo).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
	map('bar').to(barProvider).as(TRANSIENT, SINGLETON, PROVIDER)
})

describe('Given a context', function () {
	describe('when requesting an instance property', function () {
		afterEach(function () {
			callSpy.reset()
		})

		describe('and the property is a method', function () {
			it('should return the method bound to the instance itself', function () {
				var foo = rootContext.get('foo')
				var fooMethod = rootContext.get('foo.method')

				expect(fooMethod()).to.equal(42)
				expect(callSpy).to.be.calledOn(foo)
			})
		})

		describe('and the property has both getter and setters', function () {
			it('should return the property getter function', function () {
				var foo = rootContext.get('foo')
				var fooProp = rootContext.get('foo.prop')

				expect(fooProp()).to.equal(42)
				expect(callSpy).to.be.calledOn(foo)
			})

			it('should return the property setter function', function () {
				var foo = rootContext.get('foo')
				var fooProp = rootContext.get('foo.prop')

				fooProp(42)

				expect(callSpy)
					.to.be.calledOn(foo)
					.and.to.be.calledWith(42)
			})
		});

		describe('and the property is read-only', function () {
			it('should return a getter function but not setter function', function () {
				var fooReadOnly = rootContext.get('foo.readOnly')
				function testCase() { fooReadOnly(42) }

				expect(fooReadOnly()).to.equal(42)
				expect(testCase).to.throw(Error)
			})
		})

		describe('and the property is write-only', function () {
			it('should return the getter function bound to the instance itself', function () {
				var fooWriteOnly = rootContext.get('foo.writeOnly')
				function testCase() { fooWriteOnly() }

				fooWriteOnly(42)

				expect(callSpy).and.to.be.calledWith(42)
				expect(testCase).to.throw(Error)
			})
		})
	})

	describe('and an instance property created from a TRANSIENT, SINGLETON mapping', function () {
		describe('when releasing an instance property', function () {
			it('should dispose the singleton', function () {
				rootContext.get('bar.method')
				rootContext.release('bar.method')

				expect(disposeSpy).to.be.calledOnce

				disposeSpy.reset()
			})
		})

		describe('when disposing the context', function () {
			it('should dispose the singleton', function () {
				rootContext.get('bar.method')
				rootContext.dispose()

				expect(disposeSpy).to.be.calledOnce
			})
		})
	})
})
