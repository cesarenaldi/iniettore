import React from 'react'
import { render } from '@testing-library/react'
import { Context } from '@iniettore/common'
import { get, provider } from '@iniettore/core'

import { Container, useContext as useIniettoreContext } from '../src'

describe('Given a React app', () => {
  describe('when using the <Container /> component', () => {
    it('should create a new Iniettore Context and make it available to the children via React Context', () => {
      function TestAsserter () {
        const ctx = useIniettoreContext<{ num: number }>()

        expect(get(ctx.num)).toEqual(expect.any(Number))

        return null
      }

      render(
        <Container
          describe={() => ({
            num: provider(() => 42)
          })}
        >
          <TestAsserter />
        </Container>
      )
    })

    it('should allow to access bindings from an Iniettore Context injected higher up in the render tree', () => {
      function TestAsserter () {
        const ctx = useIniettoreContext<{ sqr: number }>()

        expect(get(ctx.sqr)).toEqual(expect.any(Number))

        return null
      }

      render(
        <Container
          describe={() => ({
            num: provider(() => 42)
          })}
        >
          <Container
            describe={({ num }: Context<{ num: number }>) => ({
              sqr: provider(() => get(num) ** 2)
            })}
          >
              <TestAsserter />
          </Container>
        </Container>
      )
    })
  })
})
