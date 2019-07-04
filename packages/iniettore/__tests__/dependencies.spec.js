import { context, free, get, singleton, provider } from '../src'

describe('Given a context', () => {
  describe('with 2 provider bindings, one of which depends on the other one', () => {
    describe('when acquiring an instance of such binding', () => {
      it('should resolve the dependency', () => {
        const pretendFooFactory = jest.fn(() => 42)
        class Bar {
          constructor(foo) {
            expect(foo).toEqual(42)
          }
        }
        const BarConstructorSpy = jest.spyOn(Bar, 'constructor')

        const rootContext = context(() => ({
          foo: provider(pretendFooFactory),
          bar: provider(() => new Bar(get(rootContext.foo)))
        }))

        const instance = get(rootContext.bar)
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
            constructor(date) {}
          }
          const rootContext = context(() => ({
            date: singleton(dateFactory),
            event: provider(() => new Event(get(rootContext.date)))
          }))
          get(rootContext.event)
          free(rootContext.event)
          dateFactory.mockClear()

          get(rootContext.event)

          expect(dateFactory).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})
