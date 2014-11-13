'use strict'

import iniettore from '../../src/iniettore'
import { CONSTRUCTOR, PROVIDER, VALUE } from '../../src/iniettore'

var foo = 42;

class Bar {
	constructor($foo) {
		expect($foo).to.equal(foo);
	}
}

describe('Given a context with a registered constructor', function () {
	var context;

	describe('with implicit dependency annotations', function () {

		before(function () {
			context = iniettore.create(function (map) {
				map('foo').to(foo).as(VALUE)
				map('bar').to(Bar).as(CONSTRUCTOR)
			})
		})

		describe('when requesting the corresponding mapping name', function () {

			it('should create an instance of it providing the requested dependencies', function () {
				context.get('bar');
			})
		})
	})
})
