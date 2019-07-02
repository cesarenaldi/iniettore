/**
 * @flow
 */
import { context, provider, singleton, get, free } from '../src'

describe('Given a context', () => {
  describe('with a singleton binding', () => {
    describe('when acquiring for the first time an instance of such binding', () => {
      it('should use the provided function to create an instance of the desired object', () => {
        const factorySpy = jest.fn()
        const rootContext = context(() => ({
          foo: singleton(factorySpy)
        }))

        get(rootContext.foo)

        expect(factorySpy).toHaveBeenCalledTimes(1)
      })
    })

    describe('when acquiring multiple times an instance of such binding', () => {
      it('should return the same instance', () => {
        const rootContext = context(() => ({
          foo: singleton(() => Math.random())
        }))

        const foo1 = get(rootContext.foo)
        const foo2 = get(rootContext.foo)

        expect(foo1).toBe(foo2)
      })
    })

    describe('when the provided function returns an instance of a defined class', () => {
      class Bar {
        static hello() {}
      }

      it('should ensure such instance constructor does have the static methods/properties of the original class', () => {
        const rootContext = context(() => ({
          bar: singleton(() => new Bar())
        }))

        const instance = get(rootContext.bar)

        expect(instance.constructor).toHaveProperty('hello')
      })
    })

    describe('when releasing such binding as many times as it has been acquired', () => {
      it('should release the actual instance', () => {
        const rootContext = context(() => ({
          foo: singleton(() => Math.random())
        }))

        // acquire twice
        const foo1 = get(rootContext.foo)
        const foo2 = get(rootContext.foo)

        // release twice
        free(rootContext.foo)
        free(rootContext.foo)

        const foo3 = get(rootContext.foo)
        expect(foo1).not.toBe(foo3)
      })
    })
  })

  describe('with a provider binding', () => {
    describe('when acquiring multiple times an instance of such binding', () => {
      it('should use the provided function to create an instance of the desired object each time', () => {
        class Foo {}
        const rootContext = context(() => ({
          foo: provider(() => new Foo())
        }))

        const foo1 = get(rootContext.foo)
        const foo2 = get(rootContext.foo)

        expect(foo1).toBeInstanceOf(Foo)
        expect(foo2).toBeInstanceOf(Foo)
        expect(foo1).not.toBe(foo2)
      })
    })

    describe('when the provided function returns an instance of a defined class', () => {
      class Bar {
        static hello() {}
      }

      it('should ensure such instance constructor does have the static methods/properties of the original class', () => {
        const rootContext = context(() => ({
          bar: provider(() => new Bar())
        }))

        const instance = get(rootContext.bar)

        expect(instance.constructor).toHaveProperty('hello')
      })
    })
  })
})
