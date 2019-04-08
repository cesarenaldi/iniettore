import iniettore from '../../src/iniettore'
import { PROVIDER, SINGLETON, CONSTRUCTOR, EAGER, VALUE } from '../../src/iniettore'

describe('Given a provider and a contructor', () => {
  var provider = jest.fn()
  var constructorSpy = jest.fn()

  class Foo {
    constructor(...args) {
      constructorSpy.apply(null, args)
    }
  }

  beforeEach(() => {
    provider.mockClear()
    constructorSpy.mockClear()
  })

  describe('when registering them as EAGER, SINGLETONs', () => {
    it('should create instances straightaway', () => {
      iniettore.create(map => {
        map('number')
          .to(42)
          .as(VALUE)
        map('bar')
          .to(provider)
          .as(EAGER, SINGLETON, PROVIDER)
          .injecting('number')
        map('foo')
          .to(Foo)
          .as(EAGER, SINGLETON, CONSTRUCTOR)
          .injecting('number')
      })
      expect(provider).toHaveBeenCalledWith(42)
      expect(constructorSpy).toHaveBeenCalledWith(42)
    })
  })
})
