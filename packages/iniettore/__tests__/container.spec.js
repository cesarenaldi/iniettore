import LeakDetector from 'jest-leak-detector'
import { container, free, get, singleton, provider } from '../src'

describe('Given a context', () => {
  describe('with a resolved singleton binding', () => {
    describe('when releasing the entire context', () => {
      it('should release the singleton instance stored within the context', () => {
        class Bar {
          foo() {
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

        expect(detector.isLeaking()).toBe(false)
      })
    })
  })
})
