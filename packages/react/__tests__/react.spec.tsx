import React from 'react'
import { render } from '@testing-library/react'
import { container, get, provider } from '@iniettore/core'

import { ContextProvider as IniettoreContextProvider, useContext as useIniettoreContext } from '../src'

describe('Given an iniettore context', () => {
  describe('when injected into an React context via the iniettore Provider', () => {
    it('should be available for children via the React Context API', () => {
      const context = container(() => ({
        num: provider(() => 42)
      }))

      function TestAsserter () {
        const ctx = useIniettoreContext<{ num: number }>()

        expect(get(ctx.num)).toEqual(expect.any(Number))

        return null
      }

      render(
        <IniettoreContextProvider context={context}>
          <TestAsserter />
        </IniettoreContextProvider>
      )
    })
  })
})
