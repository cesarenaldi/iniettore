import iniettore from '../src'
import { PROVIDER, VALUE } from '../src'

describe('Given a context with a registered provider', () => {
  var providerSpy = jest.fn()
  var rootContext

  describe('when requesting it with some transient dependencies ', () => {
    var TRANSIENT_DEPENDENCIES = {
      baz: 84
    }

    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(42)
          .as(VALUE)
        map('foo')
          .to(providerSpy)
          .as(PROVIDER)
          .injecting('bar', 'baz')
      })
    })

    beforeEach(() => {
      providerSpy.mockClear()
    })

    it('should also use them to resolve the final provider dependencies', () => {
      var foo = rootContext.using(TRANSIENT_DEPENDENCIES).get('foo')

      expect(providerSpy).toHaveBeenCalledWith(42, 84)
    })

    it('should not leave any transient dependency registered in the rootContext', () => {
      var foo = rootContext.using(TRANSIENT_DEPENDENCIES).get('foo')

      function testCase() {
        rootContext.get('baz')
      }

      expect(testCase).toThrow(Error)
    })
  })
})
