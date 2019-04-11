import iniettore from '../../src/iniettore'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../../src/iniettore'

function noop() {}

describe('Given a child context', () => {
  var OBJECT = {}

  describe('when requesting an alias registered in the parent context', () => {
    it('should return the same binding as requested to the parent context', () => {
      var rootContext = iniettore.create(map => {
        map('foo')
          .to(OBJECT)
          .as(VALUE)
      })
      var child = rootContext.createChild(noop)

      expect(child.get('foo')).toBe(rootContext.get('foo'))
    })
  })

  describe('when requesting the reference to the contexts', () => {
    it('should return the respective contexts', () => {
      var rootContext = iniettore.create(noop)
      var child = rootContext.createChild(noop)

      expect(rootContext.get('$context')).toBe(rootContext)
      expect(child.get('$context')).toBe(child)
      expect(rootContext.get('$context')).not.toBe(child.get('$context'))
    })
  })

  describe('with a registered alias that shadows the one registered in the parent context', () => {
    describe('when requesting its alias from the child context', () => {
      var rootContext

      beforeEach(() => {
        rootContext = iniettore.create(map => {
          map('foo')
            .to(OBJECT)
            .as(VALUE)
        })
      })

      it('should retrieve the child context version', () => {
        var child = rootContext.createChild(map => {
          map('foo')
            .to(42)
            .as(VALUE)
        })
        expect(child.get('foo')).toEqual(42)
        expect(rootContext.get('foo')).toBe(OBJECT)
      })
    })
  })

  describe('when requesting an instance from a provider registered in the child context', () => {
    describe('with a dependency from a provider registered in the parent context', () => {
      var PARENT_INSTANCE = {}
      var CHILD_INSTANCE = {}
      var parentProviderStub = jest.fn().mockReturnValue(PARENT_INSTANCE)
      var chilProviderStub = jest.fn().mockReturnValue(CHILD_INSTANCE)
      var rootContext, childContext

      beforeEach(() => {
        rootContext = iniettore.create(map => {
          map('bar')
            .to(parentProviderStub)
            .as(TRANSIENT, SINGLETON, PROVIDER)
        })
        childContext = rootContext.createChild(map => {
          map('baz')
            .to(chilProviderStub)
            .as(TRANSIENT, SINGLETON, PROVIDER)
            .injecting('bar')
        })
      })

      it('should create singleton instances in the respective contexts', () => {
        var baz = childContext.get('baz')

        expect(baz).toBe(CHILD_INSTANCE)
        expect(rootContext.get('bar')).toBe(PARENT_INSTANCE)
      })
    })
  })
})
