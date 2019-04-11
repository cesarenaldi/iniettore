import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT, BLUEPRINT } from '../../src/iniettore'

describe('Given a context', () => {
  var VALUE_A = { value: 'a' }
  var parentProvideStub = jest.fn().mockReturnValue(42)
  var rootContext

  describe('and a registered blueprint with some registered mappings', () => {
    var blueprintProviderStub = jest.fn().mockReturnValue(84)

    describe('when requesting a copy of the blueprint', () => {
      beforeAll(() => {
        function configureChildContext(map) {
          map('baz')
            .to(blueprintProviderStub)
            .as(TRANSIENT, SINGLETON, PROVIDER)
            .injecting('bar')
        }

        rootContext = iniettore.create(map => {
          map('bar')
            .to(VALUE_A)
            .as(VALUE)
          map('foo')
            .to(configureChildContext)
            .as(BLUEPRINT)
          map('pluto')
            .to(parentProvideStub)
            .as(TRANSIENT, SINGLETON, PROVIDER)
        })
      })

      it('should create a new child context', () => {
        var childContext = rootContext.get('foo')

        expect(childContext.get('bar')).toEqual(VALUE_A)
        expect(childContext.get('baz')).toEqual(84)
        expect(childContext.get('baz')).toEqual(84)
        expect(blueprintProviderStub).toHaveBeenCalledTimes(1)
        expect(blueprintProviderStub).toHaveBeenCalledWith(VALUE_A)
      })

      describe('multiple times', () => {
        it('should create a new child context each time', () => {
          var childContext1 = rootContext.get('foo')
          var childContext2 = rootContext.get('foo')

          expect(childContext1).not.toBe(childContext2)
        })
      })
    })

    describe('and a specified export alias', () => {
      beforeAll(() => {
        function configureChildContext(map) {
          map('baz')
            .to(blueprintProviderStub)
            .as(TRANSIENT, SINGLETON, PROVIDER)
            .injecting('bar')
        }

        rootContext = iniettore.create(map => {
          map('bar')
            .to(VALUE_A)
            .as(VALUE)
          map('foo')
            .to(configureChildContext)
            .as(BLUEPRINT)
            .exports('baz')
          map('pluto')
            .to(parentProvideStub)
            .as(TRANSIENT, SINGLETON, PROVIDER)
        })
      })

      describe('when requesting a copy of the blueprint', () => {
        it('should return an instance of the export alias', () => {
          expect(rootContext.get('foo')).toEqual(84)
        })
      })
    })
  })
})
