import { container, get, provider, singleton, free } from '../src'

describe('Given the iniettore v4.x interface', () => {
  describe('when migrating from v3.x interface', () => {
    it(`should provide an alternative to:

          iniettore.create(map => {
            map('foo')
              .to(Foo)
              .as(CONSTRUCTOR)
          })
      `, () => {
      class Foo {}

      const context = container(() => ({
        foo: provider(() => new Foo())
      }))

      const foo = get(context.foo)

      expect(foo).toBeInstanceOf(Foo)
    })

    it(`should ensure instances created via a constructor do preserve static methods/properties of the original class:

          class Bar {
            static hello() {}
          }
          const context = container(() => ({
            bar: provider(() => new Bar())
          }))

          const bar = get(context.bar)

          instance.constructor.hello === Bar.hello // true
      `, () => {
      class Bar {
        static hello() {}
      }
      const context = container(() => ({
        bar: provider(() => new Bar())
      }))

      const instance = get(context.bar)

      expect(instance.constructor.hello).toBe(Bar.hello)
    })

    it(`should provide alternative solution to EAGER, SINGLETON mappings:

          iniettore.create(map => {
            map('foo')
              .to(Foo)
              .as(EAGER, SINGLETON, CONSTRUCTOR)
          })
      `, () => {
      class Bar {}
      const bar = new Bar()
      const context = container(() => ({
        bar: provider(() => bar)
      }))

      expect(get(context.bar)).toBe(bar)
    })

    it(`should provide alternative solution to LAZY, SINGLETON mappings:

          iniettore.create(map => {
            map('bar')
              .to(barProvider)
              .as(LAZY, SINGLETON, CONSTRUCTOR)
          })
      `, () => {
      class Bar {}
      const context = container(() => {
        let bar

        return {
          bar: singleton(() => {
            if (!bar) {
              bar = new Bar()
            }
            return bar
          })
        }
      })
      const bar1 = get(context.bar) // acquire a first time

      free(context.bar) // release once (this should cause a release of the actual instance)

      const bar2 = get(context.bar) // acquire a second time

      expect(bar1).toBe(bar2)
    })

    it(`should provide alternative solution to transient dependencies:

          const context = iniettore.create(map => {
            map('aDependency')
              .to(...)
              .as(...);

            map('myMapping')
              .to(barProvider)
              .as(PROVIDER)
              .injecting('aDependency', 'transientDependency')
          })

          const myInstance = context
            .using({ transientDependency: 42 })
            .get('myMapping')
      `, () => {
      const barProvider = jest.fn((aDependency, transientDependency) => ({}))
      const context = container(() => ({
        baz: provider(() => true),
        bar: provider(() => barProvider.bind(null, get(context.baz)))
      }))

      const bar = get(context.bar)(42)

      expect(barProvider).toHaveBeenCalledWith(true, 42)
    })

    function branch(ctx) {
      return Object.entries(ctx).reduce((bindings, [name, binding]) => {
        bindings[name] = provider(() => get(binding))
        return bindings
      }, {})
    }

    it(`should provide alternative solution to child containers:
          const context = iniettore.create(map => {
            map(foo).to(...).as(...)
          })

          const childCOntext = context.createChild(...)

          // child.get('foo') instance of mapping defined in parent container
      `, () => {
      const context = container(() => ({
        number: provider(() => 42)
      }))
      const childContext = container(() => ({
        ...branch(context)
      }))

      expect(get(childContext.number)).toBe(42)
    })
  })
})
