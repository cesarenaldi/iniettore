'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, SINGLETON, TRANSIENT } from '../../src/options'


describe('Given a container with a registered constructor', function () {

	describe('when requesting the corresponding alias', function () {

		it('should create a new instance', function (done) {
			class Foo {
				constructor () {
					expect(this).to.be.an.instanceOf(Foo)
					done()
				}
			}

			var container = iniettore.create(function (context) {
				context
					.map('foo').to(Foo)
					.as(CONSTRUCTOR)
			})

			container.get('foo')
		})

		describe('the instance', function () {
			class Bar {
				static hello() {}
			}

			it(' should have the static method/properties of the original constructor', function () {
				var container = iniettore.create(function (context) {
					context
						.map('bar').to(Bar)
						.as(CONSTRUCTOR)
				})
				var bar = container.get('bar')

				expect(bar.constructor).to.equal(Bar)
				expect(bar.constructor).to.have.property('hello')
			})
		})
	})
})