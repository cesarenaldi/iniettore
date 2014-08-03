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
	})
})