import { container, singleton, Context, provider, get } from '@iniettore/core'

import { child } from '../src'

describe('Given a context', () => {
  describe('when a child context is create out of it', () => {
    xit('should', () => {
      const context: Context<{ foo: number, bob: Context<unknown> }> = container(() => ({
        foo: singleton(() => 42),
        bob: child(() => ({
          sub: provider(() => get(context.foo))
        }))
      }))

      type SubContext = Context<{ sub: number }>

      get((get(context.bob) as SubContext).sub)
    })
  })
})
