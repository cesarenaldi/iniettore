import LeakDetector from 'jest-leak-detector'
import { context, free, get, singleton, provider } from '../src'

describe('Given a context', () => {
  describe('with a resolved singleton binding', () => {
    describe('when releasing the entire context', () => {
      it('should release the singleton instance stored within the context', () => {
        class Bar {}
        let detector: LeakDetector
        let rootContext = context(() => ({
          bar: singleton(() => {
            const instance = new Bar()
            detector = new LeakDetector(instance)
            return instance
          })
        }))

        get(rootContext.bar)
        get(rootContext.bar)

        free(rootContext)
        rootContext = null

        expect(detector.isLeaking()).toBe(false)
      })
    })
  })
})
