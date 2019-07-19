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
})
