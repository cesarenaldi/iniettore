import { container, provider, singleton, get, free } from '../src'

describe('Given a context', () => {
  describe('with a singleton binding', () => {
    describe('when acquiring for the first time an instance of such binding', () => {
      it('should use the provided function to create an instance of the desired object', () => {
        const factorySpy = jest.fn()

        const context = container(() => ({
          foo: singleton(factorySpy)
        }))

        get(context.foo)

        expect(factorySpy).toHaveBeenCalledTimes(1)
      })
    })

    describe('when acquiring multiple times an instance of such binding', () => {
      it('should return the same instance', () => {
        const context = container(() => ({
          foo: singleton(() => Math.random())
        }))

        const foo1 = get(context.foo)
        const foo2 = get(context.foo)

        expect(foo1).toBe(foo2)
      })
    })

    describe('when releasing such binding as many times as it has been acquired', () => {
      it('should release the actual instance', () => {
        const context = container(() => ({
          foo: singleton(() => Math.random())
        }))

        // acquire twice
        const foo1 = get(context.foo)
        const foo2 = get(context.foo)

        // release twice
        free(context.foo)
        free(context.foo)

        const foo3 = get(context.foo)
        expect(foo1).not.toBe(foo3)
      })

      it('should use the optional 2nd argument callback to support any custom dispose logic', () => {
        const fooInstance = {}
        const disposeFoo = jest.fn()
        const context = container(() => ({
          foo: singleton(() => fooInstance, disposeFoo)
        }))

        get(context.foo)
        free(context.foo)

        const foo3 = get(context.foo)
        expect(disposeFoo).toHaveBeenCalledWith(fooInstance)
      })
    })
  })

  describe('with a provider binding', () => {
    describe('when acquiring multiple times an instance of such binding', () => {
      it('should use the provided function to create an instance of the desired object each time', () => {
        class Foo {}
        const context = container(() => ({
          foo: provider(() => new Foo())
        }))

        const foo1 = get(context.foo)
        const foo2 = get(context.foo)

        expect(foo1).toBeInstanceOf(Foo)
        expect(foo2).toBeInstanceOf(Foo)
        expect(foo1).not.toBe(foo2)
      })
    })
  })
})
