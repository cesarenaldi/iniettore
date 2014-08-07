'use strict'

import iniettore from '../../src/iniettore'
import { VALUE, INSTANCE } from '../../src/iniettore'

describe('Given a context', function () {

	var rootContext
	var DUMMY_VALUE = {}

	describe('with a registered object as value', function () {

		before(function () {
			rootContext = iniettore.create(function (map) {
				map('bar').to(DUMMY_VALUE).as(VALUE)
			})
		})

		it('should be possible to retrieve it', function () {
			var value = rootContext.get('bar')

			expect(value).to.deep.equal(DUMMY_VALUE)
		})
	})

	describe('with a registered object as instance', function () {

		before(function () {
			rootContext = iniettore.create(function (map) {
				map('bar').to(DUMMY_VALUE).as(INSTANCE)
			})
		})

		it('should be possible to retrieve it', function () {
			var value = rootContext.get('bar')

			expect(value).to.deep.equal(DUMMY_VALUE)
		})
	})
})