import iniettore from '../../src/iniettore'
import { TRANSIENT, PROVIDER, SINGLETON, CONSTRUCTOR } from '../../src/iniettore'

describe('Given a TRANSIENT, SINGLETON, CONSTRUCTOR mapping', () => {
  describe('when requesting it', () => {
    it('should create an instance at the first request and return it at the subsequent call', () => {
      var constructorSpy = jest.fn()
      var bar1, bar2

      class Bar {
        constructor() {
          constructorSpy.call()
        }
      }

      var rootContext = iniettore.create(map => {
        map('bar')
          .to(Bar)
          .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
      })

      expect(constructorSpy).not.toHaveBeenCalled()

      bar1 = rootContext.get('bar')

      expect(constructorSpy).toHaveBeenCalledTimes(1)

      bar2 = rootContext.get('bar')
      expect(bar2).toBe(bar1)
    })
  })

  describe('with TRANSIENT, SINGLETON, CONSTRUCTOR as shared dependency', () => {
    describe('when requesting it', () => {
      it('should create singleton instances from the respective constructors', () => {
        var commonInstance

        class Common {
          constructor() {
            commonInstance = this
          }
        }

        class Bar {
          constructor(common) {
            expect(common).toBeInstanceOf(Common)
            expect(common).toBe(commonInstance)
          }
        }

        class Foo {
          constructor(common, bar) {
            expect(common).toBeInstanceOf(Common)
            expect(common).toBe(commonInstance)
            expect(bar).toBeInstanceOf(Bar)
          }
        }

        var rootContext = iniettore.create(map => {
          map('common')
            .to(Common)
            .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
          map('bar')
            .to(Bar)
            .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
            .injecting('common')
          map('foo')
            .to(Foo)
            .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
            .injecting('common', 'bar')
        })

        expect(rootContext.get('foo')).toBeInstanceOf(Foo)
      })
    })
  })

  describe('and an instance of it', () => {
    var rootContext

    describe('when releasing the instance', () => {
      class Bar {}

      beforeEach(() => {
        rootContext = iniettore.create(map => {
          map('bar')
            .to(Bar)
            .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
        })
      })

      it('should not release the instance if still in use', () => {
        var bar1 = rootContext.get('bar')
        var bar2 = rootContext.get('bar')

        expect(bar1).toBe(bar2)

        rootContext.release('bar')

        let bar3 = rootContext.get('bar')
        expect(bar3).toBe(bar1)
      })

      describe('the same amount of times it has been requested', () => {
        it('should release the instance', () => {
          var bar1 = rootContext.get('bar')
          var bar2 = rootContext.get('bar')

          expect(bar1).toBe(bar2)

          rootContext.release('bar')
          rootContext.release('bar')

          let bar3 = rootContext.get('bar')
          expect(bar3).not.toBe(bar1)
        })
      })
    })
  })
})

describe('Given a TRANSIENT, SINGLETON, PROVIDER mapping', () => {
  describe('when requesting it', () => {
    it('should invoke the provider function at the first request and return the created item at the subsequent call', () => {
      var providerSpy = jest.fn()
      var fooProvider = () => {
        providerSpy()
        return {}
      }
      var foo1, foo2

      var rootContext = iniettore.create(map => {
        map('foo')
          .to(fooProvider)
          .as(TRANSIENT, SINGLETON, PROVIDER)
      })
      expect(providerSpy).not.toHaveBeenCalled()

      foo1 = rootContext.get('foo')

      expect(providerSpy).toHaveBeenCalledTimes(1)

      foo2 = rootContext.get('foo')
      expect(foo2).toBe(foo1)
    })
  })

  describe('and an instance created from it', () => {
    var rootContext

    describe('when releasing the instance', () => {
      function fooProvider() {
        return {}
      }

      beforeEach(() => {
        rootContext = iniettore.create(map => {
          map('foo')
            .to(fooProvider)
            .as(TRANSIENT, SINGLETON, PROVIDER)
        })
      })

      it('should not release the instance if still in use', () => {
        var foo1 = rootContext.get('foo')
        var foo2 = rootContext.get('foo')

        expect(foo1).toBe(foo2)

        rootContext.release('foo')

        let foo3 = rootContext.get('foo')
        expect(foo3).toBe(foo1)
      })

      describe('the same amount of times it has been requested', () => {
        it('should release the instance', () => {
          var foo1 = rootContext.get('foo')
          var foo2 = rootContext.get('foo')

          expect(foo1).toBe(foo2)

          rootContext.release('foo')
          rootContext.release('foo')

          let foo3 = rootContext.get('foo')
          expect(foo3).not.toBe(foo1)
        })
      })
    })
  })
})
