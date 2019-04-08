import iniettore from '../../src/iniettore'
import { FUNCTION, VALUE } from '../../src/iniettore'

describe('Given a context with a registered function', () => {
  describe('when the function has some dependencies', () => {
    const BAR = {}

    it('should return a partial application of the function', () => {
      function foo(bar, param1) {
        expect(bar).toBe(BAR)
        expect(param1).toEqual(42)
      }
      const rootContext = iniettore.create(map => {
        map('bar')
          .to(BAR)
          .as(VALUE)
        map('foo')
          .to(foo)
          .as(FUNCTION)
          .injecting('bar')
      })

      const partialApplicationOfFoo = rootContext.get('foo')
      partialApplicationOfFoo(42)
    })
  })
})
