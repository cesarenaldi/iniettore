import iniettore from '../../src'
import { CONSTRUCTOR, PROVIDER, FUNCTION, VALUE } from '../../src'

var foo = 42
var context

describe('Given a context', () => {
  describe('with a registered constructor', () => {
    describe('and with implicit dependency annotations', () => {
      describe('when requesting the corresponding mapping name', () => {
        it('should create an instance of it providing the requested dependencies', () => {
          class Bar {
            constructor($foo) {
              expect($foo).toBe(foo)
            }
          }

          context = iniettore.create(map => {
            map('foo')
              .to(foo)
              .as(VALUE)
            map('bar')
              .to(Bar)
              .as(CONSTRUCTOR)
          })
          context.get('bar')
        })
      })
    })
  })

  describe('with a registered provider', () => {
    describe('with implicit dependency annotations', () => {
      describe('when requesting the corresponding mapping name', () => {
        it('should invoke it providing the requested dependencies', () => {
          var provider = function($foo) {
            expect($foo).toBe(foo)
          }

          context = iniettore.create(map => {
            map('foo')
              .to(foo)
              .as(VALUE)
            map('bar')
              .to(provider)
              .as(PROVIDER)
          })
          context.get('bar')
        })
      })
    })
  })

  describe('with a registered provider', () => {
    describe('with implicit dependency annotations one of which is the context itself', () => {
      describe('when requesting the corresponding mapping name', () => {
        it('should invoke it providing the requested dependencies', () => {
          var provider = function($foo, $context) {
            expect($foo).toBe(foo)
            expect($context).toBe(context)
          }

          context = iniettore.create(map => {
            map('foo')
              .to(foo)
              .as(VALUE)
            map('bar')
              .to(provider)
              .as(PROVIDER)
          })
          context.get('bar')
        })
      })
    })
  })

  describe('with a registered function', () => {
    describe('with implicit dependency annotations', () => {
      describe('when requesting the corresponding mapping name', () => {
        it('should return a partial application of the function', () => {
          var func = function($foo, param1) {
            expect($foo).toBe(foo)
            expect(param1).toBe('hello')
          }
          var bar

          context = iniettore.create(map => {
            map('foo')
              .to(foo)
              .as(VALUE)
            map('bar')
              .to(func)
              .as(FUNCTION)
          })
          bar = context.get('bar')

          bar('hello')
        })
      })
    })
  })
})
