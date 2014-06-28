'use strict'

import iniettore from '../../src/iniettore'
import { VALUE } from '../../src/options'

describe('Given a container with a registered value', function () {

	var container
	var DUMMY_VALUE = {}

	before(function () {
		container = iniettore.create()
		container
			.bind('bar', DUMMY_VALUE)
			.as(VALUE)
			.done()
	})

	it('should be possible to retrieve the value', function () {
		var value = container.get('bar')

		expect(value).to.deep.equal(DUMMY_VALUE)
	})
})