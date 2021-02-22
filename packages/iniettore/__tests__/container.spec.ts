import LeakDetector from 'jest-leak-detector'
import { container, free, get, singleton } from '../src'
import lowPriorityWarning from '../src/lowPriorityWarning'

jest.mock('../src/lowPriorityWarning')

describe('Given a context', () => {
  describe('with a resolved singleton binding', () => {
    describe('when releasing the entire context', () => {
      it('should release the singleton instance stored within the context', async () => {
        class Bar {
          foo () {
            return 42
          }
        }
        let detector: LeakDetector
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

        expect(await detector.isLeaking()).toBe(false)
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
    describe('when releasing the context A', () => {
      it("should warn that there is a binding whose dependents hasn't been released", () => {
        class Bar {}
        class Foo {
          constructor (bar: Bar) {} // eslint-disable-line no-useless-constructor
        }
        const contextA = container(() => ({
          bar: singleton(() => new Bar())
        }))
        const contextB = container(() => ({
          foo: singleton(() => new Foo(get(contextA.bar)))
        }))

        get(contextB.foo) // resolve foo

        free(contextA)

        expect(lowPriorityWarning).toHaveBeenCalledWith(true, expect.any(String))
      })
    })
  })

  describe('when requesting an instance from a binding in context B which shadows a binding with the same name in context A', () => {
    it('should resolve the instance via the binding registered in the context B', () => {
      class Bar {}
      class SuperBar {}
      const contextA = container(() => ({ // eslint-disable-line no-unused-vars
        bar: singleton(() => new Bar())
      }))
      const contextB = container(() => ({
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
