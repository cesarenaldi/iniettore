import React from 'react'
import { render } from '@testing-library/react'
import { Context } from '@iniettore/common'
import { container, get, provider, singleton } from 'iniettore'

import { Container, ContextProvider, useContext } from '../src'

describe('Given a React app', () => {
  describe('when using the <ContextProvider /> component', () => {
    it('should allow to consume dependencies from an extablished Iniettore Context', () => {
      const context = container(() => ({
        num: provider(() => 42)
      }))

      function TestAsserter () {
        const { num } = useContext<{ num: Number }>()

        expect(num).toEqual(expect.any(Number))

        return null
      }

      render(
        <ContextProvider context={context}>
          <TestAsserter />
        </ContextProvider>
      )
    })
  })

  describe('when using the <Container /> component', () => {
    it('should create a new Iniettore Context and make it available via the useDependency hook', () => {
      function TestAsserter () {
        const { num } = useContext<{ num: Number }>()

        expect(num).toEqual(expect.any(Number))

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

    it('should allow a nested <Container /> to access bindings from an Iniettore Context injected higher up in the render tree', () => {
      function TestAsserter () {
        const { sqr } = useContext<{ sqr: Number }>()

        expect(sqr).toEqual(expect.any(Number))

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

  describe('when requesting a dependency via the useDependency hook', () => {
    it('should ask Iniettore to instantiate it once per containing component lifecycle', () => {
      const providerSpy = jest.fn().mockReturnValue(42)

      function TestExercise () {
        const { num } = useContext<{ num: Number }>()
        return <h1>{ num }</h1>
      }

      function TestCase() {
        return (
          <Container
            describe={() => ({
              num: provider(providerSpy)
            })}
          >
            <TestExercise />
          </Container>
        )
      }

      const { rerender } = render(<TestCase />)

      rerender(<TestCase />)

      expect(providerSpy).toHaveBeenCalledTimes(1)
    })

    it('should free any requested instance on component unmount', () => {
      const disposeSpy = jest.fn()

      function TestExercise () {
        const { num } = useContext<{ num: Number }>()
        return <h1>{ num }</h1>
      }

      function TestCase() {
        return (
          <Container
            describe={() => ({
              num: singleton(() => 42, disposeSpy)
            })}
          >
            <TestExercise />
          </Container>
        )
      }

      const { unmount } = render(<TestCase />)

      unmount()

      expect(disposeSpy).toHaveBeenCalledWith(42)
    })
  })
})
