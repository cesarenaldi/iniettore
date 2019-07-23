import LeakDetector from 'jest-leak-detector'
import { container, free, get, singleton, provider } from '../src'

const lowPriorityWarning = jest.mock('../../shared/lowPriorityWarning')

describe('Given a context', () => {
  describe('with a resolved singleton binding', () => {
    describe('when releasing the entire context', () => {
      it('should release the singleton instance stored within the context', () => {
        class Bar {
          foo() {
            return 42
          }
        }
        let detector
        let context = container(() => ({
          bar: singleton(() => {
            const instance = new Bar()
            detector = new LeakDetector(instance)
            return instance
          })
        }))

        get(context.bar)
        get(context.bar)

        free(context)
        context = null

        expect(detector.isLeaking()).toBe(false)
      })
    })
  })
})

describe(`Given 2 contexts: A and B
          +---------+
          | Context |
          |    A    |- bar
          +----+----+
               |
               |
               v
          +---------+
          | Context |
          |    B    |- foo
          +----+----+
  `, () => {
  describe('where context B has a materialized binding that depends on a binding defined in context A', () => {
    describe('when release the context A', () => {
      it("should detect that there is a binding whose dependents hasn't been released", () => {
        class Bar {}
        class Foo {}
        let contextA = container(() => ({
          bar: singleton(() => new Bar())
        }))
        let contextB = container(() => ({
          foo: singleton(() => new Foo(get(contextA.bar)))
        }))

        get(contextB.foo) // resolve foo

        free(contextA)
        expect(lowPriorityWarning).toHaveBeenCalledWith(expect.any(String))
      })
    })
  })

  describe('when requesting an instance from a binding in context B which shadows a binding with the same name in context A', () => {
    it('should resolve the instance via the binding registered in the context B', () => {
      class Bar {}
      class SuperBar {}
      let contextA = container(() => ({
        bar: singleton(() => new Bar())
      }))
      let contextB = container(() => ({
        bar: singleton(() => new SuperBar())
      }))

      const bar = get(contextB.bar)

      expect(bar).toBeInstanceOf(SuperBar)
    })
  })

  describe('when requesting an instance from a singleton binding registered in the context B', () => {
    describe('which depends on another singleton binding registered in the "parent context" A', () => {
      const PARENT_INSTANCE = {}
      const CHILD_INSTANCE = {}
      const parentProviderStub = jest.fn().mockReturnValue(PARENT_INSTANCE)
      const chilProviderStub = jest.fn().mockReturnValue(CHILD_INSTANCE)

      it('should create singleton instances in the respective contexts', () => {
        const contextA = container(() => ({
          bar: singleton(parentProviderStub)
        }))
        const contextB = container(() => ({
          foo: singleton(() => chilProviderStub(get(contextA.bar)))
        }))
        const foo = get(contextB.foo)

        expect(foo).toBe(CHILD_INSTANCE)
        expect(get(contextA.bar)).toBe(PARENT_INSTANCE)
      })
    })
  })
})
