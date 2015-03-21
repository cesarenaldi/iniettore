'use strict'

import iniettore from '../../src/iniettore'
import { CONSTRUCTOR, PROVIDER, FUNCTION, VALUE } from '../../src/iniettore'

var foo = 42
var context

describe('Given a context', function () {

	describe('with a registered constructor', function () {
		describe('and with implicit dependency annotations', function () {
			describe('when requesting the corresponding mapping name', function () {
				it('should create an instance of it providing the requested dependencies', function () {
					class Bar {
						constructor($foo) {
							expect($foo).to.equal(foo)
						}
					}

					context = iniettore.create(function (map) {
						map('foo').to(foo).as(VALUE)
						map('bar').to(Bar).as(CONSTRUCTOR)
					})
					context.get('bar')
				})
			})
		})
	})

	describe('with a registered provider', function () {
		describe('with implicit dependency annotations', function () {
			describe('when requesting the corresponding mapping name', function () {
				it('should invoke it providing the requested dependencies', function () {
					var provider = function ($foo) {
						expect($foo).to.equal(foo)
					}

					context = iniettore.create(function (map) {
						map('foo').to(foo).as(VALUE)
						map('bar').to(provider).as(PROVIDER)
					})
					context.get('bar')
				})
			})
		})
	})

	describe('with a registered provider', function () {
		describe('with implicit dependency annotations one of which is the context itself', function () {
			describe('when requesting the corresponding mapping name', function () {
				it('should invoke it providing the requested dependencies', function () {
					var provider = function ($foo, $context) {
						expect($foo).to.equal(foo)
						expect($context).to.equal(context)
					}

					context = iniettore.create(function (map) {
						map('foo').to(foo).as(VALUE)
						map('bar').to(provider).as(PROVIDER)
					})
					context.get('bar')
				})
			})
		})
	})

	describe('with a registered function', function () {
		describe('with implicit dependency annotations', function () {
			describe('when requesting the corresponding mapping name', function () {
				it('should return a partial application of the function', function () {
					var func = function ($foo, param1) {
						expect($foo).to.equal(foo)
						expect(param1).to.equal('hello')
					}
					var bar

					context = iniettore.create(function (map) {
						map('foo').to(foo).as(VALUE)
						map('bar').to(func).as(FUNCTION)
					})
					bar = context.get('bar')

					bar('hello')
				})
			})
		})
	})
})
