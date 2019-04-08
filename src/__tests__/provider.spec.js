import iniettore from '../../src/iniettore'
import { VALUE, PROVIDER } from '../../src/iniettore'

describe('Given a context with a registered provider', () => {
  var rootContext

  var BAR_1 = { bar: 1, dispose: jest.fn() }
  var BAR_2 = { bar: 2, dispose: jest.fn() }
  var providerStub = jest.fn()

  beforeEach(() => {
    providerStub.mockClear()
    providerStub.mockReturnValueOnce(BAR_1).mockReturnValueOnce(BAR_2)
    BAR_1.dispose.mockClear()
    BAR_2.dispose.mockClear()
  })

  describe('when requesting multiple times the corresponding alias', () => {
    it('should invoke the provider function at every request with his dependencies', () => {
      var result

      rootContext = iniettore.create(map => {
        map('foo')
          .to(42)
          .as(VALUE)
        map('bar')
          .to(providerStub)
          .as(PROVIDER)
          .injecting('foo')
      })

      result = rootContext.get('bar')

      expect(result).toBe(BAR_1)
      expect(providerStub).toHaveBeenCalledTimes(1)
      expect(providerStub).toHaveBeenCalledWith(42)

      result = rootContext.get('bar')

      expect(result).toBe(BAR_2)
      expect(providerStub).toHaveBeenCalledTimes(2)
      expect(providerStub).toHaveBeenCalledWith(42)
    })
  })
})
