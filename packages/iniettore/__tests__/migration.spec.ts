import { ContainerDescriptor, Context } from '../../shared/types'
import { container, get, provider, singleton, free } from '../src'

describe('Given the iniettore v4.x interface', () => {
  describe('when migrating from v3.x interface', () => {
    it(`should provide an alternative to CONSTRUCTOR mappings:

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
      const barProvider = jest.fn((aDependency: boolean, transientDependency: number) => ({}))
      const context = container(() => ({
        baz: provider(() => true),
        bar: provider(() => (v: number) => barProvider(get(context.baz), v))
      }))

      get(context.bar)(42)

      expect(barProvider).toHaveBeenCalledWith(true, 42)
    })

    function branch (ctx: Context<ContainerDescriptor>): ContainerDescriptor {
      return Object.entries(ctx).reduce((bindings, [name, binding]) => {
        bindings[name] = provider(() => get(binding))
        return bindings
      }, {})
    }

    it(`should provide alternative solution to inheritance of mappings (not recommended in v4.x):

          const context = iniettore.create(map => {
            map(foo).to(...).as(...)
          })

          const childContext = context.createChild(...)

          // child.get('foo') instance of mapping defined in parent context
      `, () => {
      const context = container(() => ({
        number: provider(() => 42)
      }))
      const childContext = container(() => ({
        ...branch(context)
      }))

      expect(get(childContext.number)).toBe(42)
    })

    it(`should provide alternative solution to $context special built-in mapping:

          const context = iniettore.create(map => {
            map(foo).to(...).as(...).injecting('$context')
          })
      `, () => {
      const factorySpy = jest.fn(ctx => new Date())
      const context = container(() => ({
        eventDate: provider(() => factorySpy(context))
      }))

      get(context.eventDate)

      expect(factorySpy).toHaveBeenCalledWith(context)
    })

    it(`should provide alternative solution to blueprint:

          function configureChildContext(map) {
            map('baz')
              .to(blueprintProviderStub)
              .as(TRANSIENT, SINGLETON, PROVIDER)
              .injecting('bar')
          }

          const context = iniettore.create(map => {
            map('bar')
              .to(VALUE_A)
              .as(VALUE)
            map('foo')
              .to(configureChildContext)
              .as(BLUEPRINT)
              .exports('baz')
          })

          // context.get('foo')
            `, () => {
      const context = container(() => ({
        bar: provider(() => new Number()), // eslint-disable-line no-new-wrappers
        foo: provider(() => {
          const childContext = container(() => ({
            baz: provider(() => new Date())
          }))

          return get(childContext.baz)
        })
      }))

      expect(get(context.foo)).toBeInstanceOf(Date)
    })
  })
})
