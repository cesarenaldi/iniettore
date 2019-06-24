import iniettore from '../src'
import { VALUE, CONSTRUCTOR, SINGLETON, TRANSIENT } from '../src'

describe('Given a context with a registered constructor', () => {
  describe('when requesting the corresponding mapping name', () => {
    it('should create a new instance', done => {
      class Foo {
        constructor() {
          expect(this).toBeInstanceOf(Foo)
          done()
        }
      }

      var rootContext = iniettore.create(map => {
        map('foo')
          .to(Foo)
          .as(CONSTRUCTOR)
      })

      rootContext.get('foo')
    })

    describe('the created instance constructor', () => {
      class Bar {
        static hello() {}
      }

      it('should have the static method/properties of the original constructor', () => {
        var rootContext = iniettore.create(map => {
          map('bar')
            .to(Bar)
            .as(CONSTRUCTOR)
        })
        var bar = rootContext.get('bar')

        expect(bar.constructor).toEqual(Bar)
        expect(bar.constructor).toHaveProperty('hello')
      })
    })
  })
})
