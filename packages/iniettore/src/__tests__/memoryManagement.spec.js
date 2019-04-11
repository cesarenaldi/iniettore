import LeakDetector from 'jest-leak-detector'
import iniettore from '../../src/iniettore'
import { CONSTRUCTOR, LAZY, PROVIDER, SINGLETON, TRANSIENT } from '../../src/iniettore'

describe('Given a context', () => {
  describe('with a TRANSIENT, SINGLETON mapping', () => {
    describe('when releasing an instance generated with such mapping', () => {
      it('should remove any reference to the instance so that memory can be freed correctly', () => {
        class Foo {}
        let detector
        const rootContext = iniettore.create(map => {
          map('foo')
            .to(() => {
              const instance = new Foo()
              detector = new LeakDetector(instance)
              return instance
            })
            .as(TRANSIENT, SINGLETON, PROVIDER)
        })

        rootContext.get('foo')
        rootContext.release('foo')

        expect(detector.isLeaking()).toBe(false)
      })
    })
  })

  describe('with a SINGLETON mapping', () => {
    describe('when disposing the context', () => {
      it('should remove any reference to instances create with such mapping so that memory can be freed correctly', () => {
        class Foo {}
        let detector
        const rootContext = iniettore.create(map => {
          map('foo')
            .to(() => {
              const instance = new Foo()
              detector = new LeakDetector(instance)
              return instance
            })
            .as(LAZY, SINGLETON, PROVIDER)
        })

        rootContext.get('foo')
        rootContext.dispose()

        expect(detector.isLeaking()).toBe(false)
      })
    })
  })

  describe('with a child context that has some SINGLETON instances instatiantes', () => {
    describe('when disposing the child context', () => {
      it('should remove any reference to such instances so that memory can be freed correctly', () => {
        class Foo {}
        let detector
        const rootContext = iniettore.create(() => void 0)
        const childContext = rootContext.createChild(map => {
          map('foo')
            .to(() => {
              const instance = new Foo()
              detector = new LeakDetector(instance)
              return instance
            })
            .as(LAZY, SINGLETON, PROVIDER)
        })

        childContext.get('foo')
        childContext.dispose()

        expect(detector.isLeaking()).toBe(false)
      })

      it('should remove any internal reference to the child context itself so that memory can be freed correctly', () => {
        class Foo {}
        const rootContext = iniettore.create(() => void 0)
        let childContext = rootContext.createChild(map => {
          map('foo')
            .to(Foo)
            .as(LAZY, SINGLETON, CONSTRUCTOR)
        })
        const detector = new LeakDetector(childContext)

        childContext.get('foo')
        childContext.dispose()
        childContext = null

        expect(detector.isLeaking()).toBe(false)
      })
    })
  })
})
