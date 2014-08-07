'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, SINGLETON, TRANSIENT } from '../../src/iniettore'


describe('Given a context with a registered constructor', function () {

	describe('when requesting the corresponding mapping name', function () {

		it('should create a new instance', function (done) {
			class Foo {
				constructor () {
					expect(this).to.be.an.instanceOf(Foo)
					done()
				}
			}

			var rootContext = iniettore.create(function (map) {
				map('foo').to(Foo).as(CONSTRUCTOR)
			})

			rootContext.get('foo')
		})

		describe('the created instance constructor', function () {
			class Bar {
				static hello() {}
			}

			it('should have the static method/properties of the original constructor', function () {
				var rootContext = iniettore.create(function (map) {
					map('bar').to(Bar).as(CONSTRUCTOR)
				})
				var bar = rootContext.get('bar')

				expect(bar.constructor).to.equal(Bar)
				expect(bar.constructor).to.have.property('hello')
			})
		})
	})
})