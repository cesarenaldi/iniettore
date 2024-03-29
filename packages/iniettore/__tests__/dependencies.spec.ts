import { BindingDescriptor } from '@iniettore/common'
import { Context, container, free, get, singleton, provider } from '../src'

describe('Given a context', () => {
  describe('with 2 provider bindings, one of which depends on the other one', () => {
    describe('when acquiring an instance of such binding', () => {
      it('should resolve the dependency', () => {
        class Bar {
          constructor (foo: number) {
            expect(foo).toEqual(42)
          }
        }

        const context: Context<{ foo: number, bar: Bar }> = container(() => ({
          foo: provider(() => 42),
          bar: provider(() => new Bar(get(context.foo)))
        }))

        const instance = get(context.bar)

        expect(instance).toBeInstanceOf(Bar)
      })
    })
  })

  describe('with a singleton binding', () => {
    describe('and a provider binding which depends on an instance of the singleton binding', () => {
      describe('when releasing all instances created via the provider binding', () => {
        it('should release the singleton instance as well', () => {
          const dateFactory = jest.fn(() => new Date())
          class Event {
            constructor (_: Date) {} // eslint-disable-line no-useless-constructor
          }
          const context: Context<{ date: Date, event: Event }> = container(() => ({
            date: singleton(dateFactory),
            event: provider(() => new Event(get(context.date)))
          }))
          get(context.event)
          free(context.event)
          dateFactory.mockClear()

          get(context.event)

          expect(dateFactory).toHaveBeenCalledTimes(1)
        })
      })
    })
  })

  describe('with some materialized bindings', () => {
    describe('when releasing one of such bindings', () => {
      it('should remove the dependency bindings from the internal list of dependencies', () => {
        const dateFactory = () => new Date()
        const customBindingDescriptorFreeSpy = jest.fn()
        const customBindingDescriptor = (fn: typeof dateFactory): BindingDescriptor<ReturnType<typeof dateFactory>> => ({
          get: fn,
          free: customBindingDescriptorFreeSpy
        })
        class Event {
          constructor (_: Date) {} // eslint-disable-line no-useless-constructor
        }
        const context: Context<{ date: Date, event: Event }> = container(() => ({
          date: customBindingDescriptor(dateFactory),
          event: singleton(() => new Event(get(context.date)))
        }))

        get(context.event)
        free(context.event)

        customBindingDescriptorFreeSpy.mockClear()
        get(context.event)
        free(context.event) // if invokes customBindingDescriptorFreeSpy more than one we have a leak

        expect(customBindingDescriptorFreeSpy).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('with a nasty circular dependency', () => {
    describe('when acquiring an instance of a binding involved in such circular dependency', () => {
      it('should throw an infomative error regarding the problem at hand', () => {
        class Foo {
          constructor (_: Bar) {} // eslint-disable-line no-useless-constructor
        }
        class Bar {
          constructor (_: Foo) {} // eslint-disable-line no-useless-constructor
        }
        const context: Context<{ foo: Foo, bar: Bar }> = container(() => ({
          foo: provider(() => new Foo(get(context.bar))),
          bar: provider(() => new Bar(get(context.foo)))
        }))

        expect(() => get(context.foo)).toThrow(/^Circular dependency detected while resolving 'foo'/)
      })
    })
  })
})
