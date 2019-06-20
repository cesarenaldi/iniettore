import iniettore from '../../src'
import { VALUE, INSTANCE } from '../../src'

describe('Given a context', () => {
  var rootContext
  var DUMMY_VALUE = {}

  describe('with a registered object as value', () => {
    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(DUMMY_VALUE)
          .as(VALUE)
      })
    })

    it('should be possible to retrieve it', () => {
      var value = rootContext.get('bar')

      expect(value).toBe(DUMMY_VALUE)
    })
  })

  describe('with a registered object as instance', () => {
    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(DUMMY_VALUE)
          .as(INSTANCE)
      })
    })

    it('should be possible to retrieve it', () => {
      var value = rootContext.get('bar')

      expect(value).toBe(DUMMY_VALUE)
    })
  })
})
