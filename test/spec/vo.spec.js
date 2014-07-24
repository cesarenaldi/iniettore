'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, INSTANCE } from '../../src/options'

describe('Given a container', function () {

	var container
	var DUMMY_VALUE = {}

	describe('with a registered object as value', function () {

		before(function () {
			container = iniettore.create(function (container) {
				container
					.map('bar').to(DUMMY_VALUE)
					.as(VALUE)
			})
		})

		it('should be possible to retrieve it', function () {
			var value = container.get('bar')

			expect(value).to.deep.equal(DUMMY_VALUE)
		})
	})

	describe('with a registered object as instance', function () {

		before(function () {
			container = iniettore.create(function (container) {
				container
					.map('bar').to(DUMMY_VALUE)
					.as(INSTANCE)
			})
		})

		it('should be possible to retrieve it', function () {
			var value = container.get('bar')

			expect(value).to.deep.equal(DUMMY_VALUE)
		})
	})
})