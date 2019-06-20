import iniettore from '../../src'
import { VALUE, CONSTRUCTOR, PROVIDER, SINGLETON, TRANSIENT } from '../../src'

describe('Given a context with some registered mappings', () => {
  var rootContext

  class Bar {
    constructor(foo) {
      expect(foo).toEqual(42)
    }
  }

  function provider(bar) {}

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => void 0)
  })

  beforeEach(() => {
    console.log.mockClear()
  })

  afterAll(() => {
    console.log.mockRestore()
  })

  describe('with no debug option', () => {
    beforeAll(() => {
      rootContext = iniettore.create(map => {
        map('foo')
          .to(42)
          .as(VALUE)
        map('bar')
          .to(Bar)
          .as(CONSTRUCTOR)
          .injecting('foo')
        map('baz')
          .to(provider)
          .as(PROVIDER)
          .injecting('bar')
      })
    })

    describe('when requesting a mapping', () => {
      it('should not log any information', () => {
        rootContext.get('baz')
        expect(console.log).not.toHaveBeenCalled()
      })
    })
  })

  describe('with the debug option set to true', () => {
    beforeAll(() => {
      rootContext = iniettore.create(
        map => {
          map('foo')
            .to(42)
            .as(VALUE)
          map('bar')
            .to(Bar)
            .as(CONSTRUCTOR)
            .injecting('foo')
          map('baz')
            .to(provider)
            .as(PROVIDER)
            .injecting('bar')
        },
        { debug: true }
      )
    })

    describe('and process.env.NODE_ENV is different from `production`', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'development'
      })

      describe('when requesting a mapping', () => {
        it('should print log information in a hierarchical way', () => {
          rootContext.get('baz')

          expect(console.log).toHaveBeenCalledTimes(6)
          expect(console.log.mock.calls[0][0]).toEqual(
            expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Starting resolving 'baz'.../)
          )
          expect(console.log.mock.calls[1][0]).toEqual(
            expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]   Starting resolving 'bar'.../)
          )
          expect(console.log.mock.calls[2][0]).toEqual(
            expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]     Starting resolving 'foo'.../)
          )
          expect(console.log.mock.calls[3][0]).toEqual(
            expect.stringMatching(
              /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]     Finished resolving 'foo' after \d+ ms/
            )
          )
          expect(console.log.mock.calls[4][0]).toEqual(
            expect.stringMatching(
              /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]   Finished resolving 'bar' after \d+ ms/
            )
          )
          expect(console.log.mock.calls[5][0]).toEqual(
            expect.stringMatching(
              /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Finished resolving 'baz' after \d+ ms/
            )
          )
        })
      })
    })

    describe('and process.env.NODE_ENV is set to `production`', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'production'
      })

      describe('when requesting a mapping', () => {
        it('should not log any information', () => {
          rootContext.get('baz')
          expect(console.log).not.toHaveBeenCalled()
        })
      })
    })
  })
})
