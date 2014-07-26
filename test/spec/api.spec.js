'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../../src/options'

describe('Given a container', function () {

	it('should be possible to register all sort of binding through the segregated contribution function', function () {

		class Bar {
			constructor(foo) {
				expect(foo).to.equal(42)
			}
		}

		var container = iniettore.create(function (context) {
			context
				.map('foo').to(42).as(VALUE)
				.map('bar').to(Bar).as(CONSTRUCTOR).injecting('foo')
		})

		expect(container.get('bar')).to.be.instanceOf(Bar)
	})
})