import iniettore from '../../src/iniettore'
import { CONSTRUCTOR, EAGER, INSTANCE, LAZY, PROVIDER, SINGLETON, TRANSIENT, VALUE } from '../../src/iniettore'

describe('Given a context', () => {
  var providerStub = jest.fn()
  var BazDisposeSpy = jest.fn()
  var rootContext

  var BAR_1 = { bar: 1, dispose: jest.fn() }
  var BAR_2 = { bar: 2, dispose: jest.fn() }
  var OBJECT_DEP = { dispose: jest.fn() }

  class Baz {
    dispose() {
      BazDisposeSpy()
    }
  }

  describe('when releasing a TRANSIENT, SINGLETON instance', () => {
    beforeEach(() => {
      providerStub.mockReturnValueOnce(BAR_1).mockReturnValueOnce(BAR_2)
      BazDisposeSpy.mockClear()

      providerStub

      rootContext = iniettore.create(map => {
        map('foo')
          .to(OBJECT_DEP)
          .as(VALUE)
        map('baz')
          .to(Baz)
          .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
          .injecting('foo')
        map('bar')
          .to(providerStub)
          .as(TRANSIENT, SINGLETON, PROVIDER)
          .injecting('foo', 'baz')
      })

      BAR_1.dispose.mockClear()
      BAR_2.dispose.mockClear()
    })

    it('should call instance.dispose() method', () => {
      var bar1 = rootContext.get('bar')
      var bar2 = rootContext.get('bar')

      expect(bar2).toBe(bar1)

      rootContext.release('bar')
      rootContext.release('bar')

      expect(BAR_1.dispose).toHaveBeenCalled()
      expect(rootContext.get('bar')).not.toBe(bar1)
    })

    it('should release all the singleton dependencies', () => {
      var bar = rootContext.get('bar')

      rootContext.release('bar')

      expect(BAR_1.dispose).toHaveBeenCalled()
      expect(BazDisposeSpy).toHaveBeenCalled()
    })

    it('should not call dispose for dependencies that are still in use', () => {
      var bar = rootContext.get('bar')

      rootContext.get('baz')
      rootContext.release('bar')

      expect(BazDisposeSpy).not.toHaveBeenCalled()
    })

    it('should not call dispose for any non singleton dependencies', () => {
      var bar = rootContext.get('bar')

      rootContext.get('baz')
      rootContext.release('bar')

      expect(OBJECT_DEP.dispose).not.toHaveBeenCalled()
    })

    describe('and the instance does not have a dispose method', () => {
      class Foo {}

      beforeEach(() => {
        rootContext = iniettore.create(map => {
          map('foo')
            .to(Foo)
            .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
        })
        rootContext.get('foo')
      })

      it('should not throw an Error', () => {
        function testCase() {
          rootContext.release('foo')
        }
        expect(testCase).not.toThrow(TypeError)
      })
    })
  })

  describe('with a singleton with a dependency', () => {
    describe('when disposing the context', () => {
      it('should dispose all the disposable instances without throwing an error', () => {
        const instanceA = { dispose: jest.fn() }
        const instanceB = { dispose: jest.fn() }
        function aProvider() {
          return instanceA
        }
        function bProvider(instanceA) {
          return instanceB
        }

        rootContext = iniettore
          .create(map => {
            map('instanceA')
              .to(aProvider)
              .as(LAZY, SINGLETON, PROVIDER)
            map('instanceB')
              .to(bProvider)
              .as(EAGER, SINGLETON, PROVIDER)
              .injecting('instanceA')
          })
          .dispose()

        expect(instanceA.dispose).toHaveBeenCalled()
        expect(instanceB.dispose).toHaveBeenCalled()
      })
    })
  })

  describe('with a registered TRANSIENT, SINGLETON, CONSTRUCTOR and a TRANSIENT, SINGLETON, PROVIDER', () => {
    class Bar {}
    function dummyProvider() {
      return {}
    }

    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(Bar)
          .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
        map('foo')
          .to(dummyProvider)
          .as(TRANSIENT, SINGLETON, PROVIDER)
      })
    })

    describe('and none of the two has been requested before', () => {
      describe('when disposing the context', () => {
        it("should not throw an Error related to dispoding instances that don't exists", () => {
          function testCase() {
            rootContext.dispose()
          }
          expect(testCase).not.toThrow(new TypeError(`Cannot read property 'dispose' of undefined`))
        })
      })
    })
  })

  describe('and a child context', () => {
    var INSTANCE_IN_PARENT = { dispose: jest.fn() }
    var INSTANCE_IN_CHILD = { dispose: jest.fn() }
    var parentProviderStub = jest.fn().mockReturnValue(INSTANCE_IN_PARENT)
    var chilProviderStub = jest.fn().mockReturnValue(INSTANCE_IN_CHILD)
    var childContext

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
      INSTANCE_IN_PARENT.dispose.mockClear()
      INSTANCE_IN_CHILD.dispose.mockClear()
    })

    describe('when disposing a TRANSIENT, SINGLETON instance in the child context', () => {
      describe('with a dependency in the parent context', () => {
        beforeEach(() => {
          childContext.get('baz')
        })

        it('should dispose both in the corresponding contexts', () => {
          childContext.release('baz')
          expect(INSTANCE_IN_CHILD.dispose).toHaveBeenCalled()
          expect(INSTANCE_IN_PARENT.dispose).toHaveBeenCalled()
        })

        it('should dispose only the child one if the parent one is still in use', () => {
          rootContext.get('bar')
          childContext.release('baz')
          expect(INSTANCE_IN_CHILD.dispose).toHaveBeenCalled()
          expect(INSTANCE_IN_PARENT.dispose).not.toHaveBeenCalled()
        })
      })
    })

    describe('when disposing the child context', () => {
      it('should dispose the registered TRANSIENT; SINGLETON instances in the respective contexts', () => {
        childContext.get('baz')
        childContext.dispose()
        expect(INSTANCE_IN_CHILD.dispose).toHaveBeenCalled()
        expect(INSTANCE_IN_PARENT.dispose).toHaveBeenCalled()
      })
    })

    describe('when disposing the parent context', () => {
      beforeEach(() => {
        jest.spyOn(childContext, 'dispose')
        childContext.dispose.mockClear()
      })

      afterAll(() => {
        childContext.dispose.restore()
      })

      it('should dispose the child context as well', () => {
        rootContext.dispose()
        expect(childContext.dispose).toHaveBeenCalled()
      })

      it('should dispose SINGLETON instances in the child context before moving to dispose the ones in the parent context', () => {
        childContext.get('bar') // request bar to avoid auto-dispose when disposing child context and its instances
        childContext.get('baz')
        rootContext.dispose()
        expect(INSTANCE_IN_PARENT.dispose).toHaveBeenCalled()
        expect(INSTANCE_IN_CHILD.dispose).toHaveBeenCalled()
        // expect(INSTANCE_IN_CHILD.dispose).toHaveBeenCalledBefore(INSTANCE_IN_PARENT.dispose)
      })

      describe('after having disposed a child context', () => {
        it('should not call the child dispose method', () => {
          childContext.dispose()
          childContext.dispose.mockClear()
          rootContext.dispose()
          expect(childContext.dispose).not.toHaveBeenCalled()
        })
      })
    })
  })
})
