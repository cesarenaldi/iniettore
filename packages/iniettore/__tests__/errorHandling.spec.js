import iniettore from '../src'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../src'

describe('Given iniettore', () => {
  describe('when creating a new context without a contribution function', () => {
    it('should throw an Error', () => {
      function testCase() {
        iniettore.create()
      }

      expect(testCase).toThrow(/missing contribution function/i)
    })
  })
})

describe('Given a context', () => {
  var rootContext

  describe('when registering a mapping with an invalid options combination', () => {
    it('should throw an Error', () => {
      function testCase() {
        iniettore.create(map => {
          map('foo')
            .to({})
            .as(SINGLETON, VALUE)
        })
      }
      expect(testCase).toThrow(/invalid flags combination/i)
    })
  })

  describe('when requesting an alias that has never registered before', () => {
    beforeAll(() => {
      rootContext = iniettore.create(() => {})
    })

    it('should throw an Error', () => {
      function testCase() {
        rootContext.get('pluto')
      }
      expect(testCase).toThrow(new Error("'pluto' is not available. Has it ever been registered?."))
    })
  })

  describe('with a registered constructor', () => {
    class Foo {
      constructor() {
        throw new Error('Unexpected issue')
      }
    }

    beforeEach(() => {
      rootContext = iniettore.create(map => {
        map('foo')
          .to(Foo)
          .as(CONSTRUCTOR)
      })
    })

    describe('when the constructor throw an Error', () => {
      it('should catch it and throw an Error specifing the failing component', () => {
        function testCase() {
          rootContext.get('foo')
        }
        expect(testCase).toThrow(new Error("Failed while resolving 'foo' due to:\n\tUnexpected issue"))
      })
    })
  })

  describe('with a registered singleton', () => {
    var DUMMY_INSTANCE = {
      dispose: () => {
        throw new Error('Unexpected issue')
      }
    }
    var providerStub = jest.fn().mockReturnValue(DUMMY_INSTANCE)

    beforeEach(() => {
      rootContext = iniettore.create(map => {
        map('bar')
          .to(providerStub)
          .as(TRANSIENT, SINGLETON, PROVIDER)
      })
    })

    describe('when the releasing the singleton instance', () => {
      it('should enrich the message of any error the instance dispose method may throw', () => {
        rootContext.get('bar')
        function testCase() {
          rootContext.release('bar')
        }
        expect(testCase).toThrow(new Error("Failed while releasing 'bar' due to:\n\tUnexpected issue"))
      })
    })

    describe('when disposing the context itself', () => {
      it('should enrich the message of any error the instance dispose method may throw', () => {
        rootContext.get('bar')
        function testCase() {
          rootContext.dispose()
        }
        expect(testCase).toThrow(new Error("Failed while disposing 'bar' due to:\n\tUnexpected issue"))
      })
    })
  })

  describe('with a circular dependency', () => {
    describe('when requesting the corresponding alias', () => {
      it('should throw an Error', () => {
        class Bar {}

        rootContext = iniettore.create(map => {
          map('bar')
            .to(Bar)
            .as(CONSTRUCTOR)
            .injecting('bar')
        })

        function testCase() {
          rootContext.get('bar')
        }
        expect(testCase).toThrow(/Circular dependency/)
      })
    })
  })
})
