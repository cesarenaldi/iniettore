/**
 * @flow
 */
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
})
