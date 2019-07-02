import iniettore from './src'
import { TRANSIENT, LAZY, PROVIDER, SINGLETON, CONSTRUCTOR, EAGER } from './src'

describe('Given a LAZY, SINGLETON, CONSTRUCTOR', () => {
  var constructorSpy = jest.fn()

  class Bar {
    constructor() {
      constructorSpy()
    }
  }

  describe('when registering it into the context', () => {
    it('should not create an instance', () => {
      iniettore.create(map => {
        map('bar')
          .to(Bar)
          .as(LAZY, SINGLETON, CONSTRUCTOR)
      })
      expect(constructorSpy).not.toHaveBeenCalled()
    })
  })

  describe('when requesting the mapping for the first time', () => {
    var rootContext

    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(Bar)
          .as(LAZY, SINGLETON, CONSTRUCTOR)
      })
    })

    it('should create an instance', () => {
      rootContext.get('bar')
      expect(constructorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('when requesting the mapping multiple times', () => {
    var rootContext

    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(Bar)
          .as(LAZY, SINGLETON, CONSTRUCTOR)
      })
    })

    it('should return the same instance', () => {
      var bar1 = rootContext.get('bar')
      var bar2 = rootContext.get('bar')
      expect(bar1).toBe(bar2)
    })
  })

  describe('when invoking rootContext.release with the corresponding mapping name', () => {
    var rootContext

    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(Bar)
          .as(LAZY, SINGLETON, CONSTRUCTOR)
      })
    })

    it('should not release the instance', () => {
      var bar1 = rootContext.get('bar')
      rootContext.release('bar')
      var bar2 = rootContext.get('bar')
      expect(bar1).toBe(bar2)
    })
  })
})

describe('Given a LAZY, SINGLETON, PROVIDER', () => {
  var barProvider = jest.fn()

  describe('when registering it into the context', () => {
    it('should not invoke the provider function', () => {
      iniettore.create(map => {
        map('bar')
          .to(barProvider)
          .as(LAZY, SINGLETON, PROVIDER)
      })
      expect(barProvider).not.toHaveBeenCalled()
    })
  })

  describe('when requesting the mapping for the first time', () => {
    var rootContext

    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(barProvider)
          .as(LAZY, SINGLETON, PROVIDER)
      })
    })

    it('should invoke the provider function', () => {
      rootContext.get('bar')
      expect(barProvider).toHaveBeenCalledTimes(1)
    })
  })

  describe('when requesting the mapping multiple times', () => {
    var rootContext
    function barProvider() {
      return {}
    }

    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(barProvider)
          .as(LAZY, SINGLETON, PROVIDER)
      })
    })

    it('should return the instance created at the first request', () => {
      var bar1 = rootContext.get('bar')
      var bar2 = rootContext.get('bar')
      expect(bar1).toBe(bar2)
    })
  })

  describe('when invoking rootContext.release with the corresponding mapping name', () => {
    var rootContext
    function barProvider() {
      return {}
    }

    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(barProvider)
          .as(LAZY, SINGLETON, PROVIDER)
      })
    })

    it('should not release the instance', () => {
      var bar1 = rootContext.get('bar')
      rootContext.release('bar')
      var bar2 = rootContext.get('bar')
      expect(bar1).toBe(bar2)
    })
  })
})
