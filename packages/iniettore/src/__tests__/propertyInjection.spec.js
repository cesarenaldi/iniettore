import iniettore from '../../src'
import { PROVIDER, CONSTRUCTOR, SINGLETON, TRANSIENT } from '../../src'

var disposeSpy = jest.fn()
var callSpy = jest.fn().mockReturnValue(42)

class Foo {
  get prop() {
    return callSpy.call(this)
  }
  set prop(value) {
    callSpy.call(this, value)
  }
  get readOnly() {
    return callSpy.call(this)
  }
  set writeOnly(value) {
    callSpy.call(this, value)
  }
  method() {
    return callSpy.call(this)
  }
}

function barProvider() {
  return {
    method() {},
    dispose: disposeSpy
  }
}

var rootContext = iniettore.create(map => {
  map('foo')
    .to(Foo)
    .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
  map('bar')
    .to(barProvider)
    .as(TRANSIENT, SINGLETON, PROVIDER)
})

describe('Given a context', () => {
  describe('when requesting an instance property', () => {
    afterEach(() => {
      callSpy.mockClear()
    })

    describe('and the property is a method', () => {
      it('should return the method bound to the instance itself', () => {
        var foo = rootContext.get('foo')
        var fooMethod = rootContext.get('foo.method')

        expect(fooMethod()).toEqual(42)
        expect(callSpy.mock.instances[0]).toBe(foo)
      })
    })

    describe('and the property has both getter and setters', () => {
      it('should return the property getter function', () => {
        var foo = rootContext.get('foo')
        var fooProp = rootContext.get('foo.prop')

        expect(fooProp()).toEqual(42)
        expect(callSpy.mock.instances[0]).toBe(foo)
      })

      it('should return the property setter function', () => {
        var foo = rootContext.get('foo')
        var fooProp = rootContext.get('foo.prop')

        fooProp(42)

        expect(callSpy.mock.instances[0]).toBe(foo)
        expect(callSpy).toHaveBeenCalledWith(42)
      })
    })

    describe('and the property is read-only', () => {
      it('should return a getter function but not setter function', () => {
        var fooReadOnly = rootContext.get('foo.readOnly')
        function testCase() {
          fooReadOnly(42)
        }

        expect(fooReadOnly()).toEqual(42)
        expect(testCase).toThrow(Error)
      })
    })

    describe('and the property is write-only', () => {
      it('should return the getter function bound to the instance itself', () => {
        var fooWriteOnly = rootContext.get('foo.writeOnly')
        function testCase() {
          fooWriteOnly()
        }

        fooWriteOnly(42)

        expect(callSpy).toHaveBeenCalledWith(42)
        expect(testCase).toThrow(Error)
      })
    })
  })

  describe('and an instance property created from a TRANSIENT, SINGLETON mapping', () => {
    afterEach(() => {
      disposeSpy.mockClear()
    })

    describe('when releasing an instance property', () => {
      it('should dispose the singleton', () => {
        rootContext.get('bar.method')
        rootContext.release('bar.method')

        expect(disposeSpy).toHaveBeenCalledTimes(1)
      })
    })

    describe('when disposing the context', () => {
      it('should dispose the singleton', () => {
        rootContext.get('bar.method')
        rootContext.dispose()

        expect(disposeSpy).toHaveBeenCalledTimes(1)
      })
    })
  })
})
