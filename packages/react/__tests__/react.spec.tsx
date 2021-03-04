import React, { useContext } from 'react'
import { render } from '@testing-library/react'
import { container, get, provider } from '@iniettore/core'

import { IniettoreContext, Provider } from '../src'

describe('Given an iniettore context', () => {
  describe('when injected into an React context via the iniettore Provider', () => {
    it('should be available for children via the React Context API', () => {
      const context = container(() => ({
        num: provider(() => 42)
      }))

      type ContextProps = typeof context

      function TestAsserter () {
        const ctx: ContextProps = useContext(IniettoreContext) as ContextProps

        expect(get(ctx.num)).toEqual(expect.any(Number))

        return null
      }

      render(
        <Provider context={context}>
          <TestAsserter />
        </Provider>
      )
    })
  })
})
