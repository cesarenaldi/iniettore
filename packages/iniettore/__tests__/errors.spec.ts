import { Binding, BindingDescriptor, Context } from '@iniettore/common'
import { free, get } from '../src'

describe('Given Iniettore v4 interface', () => {
  describe('when `get` handler is invoked with something that is not a Binding', () => {
    it('should throw a useful error', () => {
      const notABinding = undefined as unknown as Binding<BindingDescriptor<unknown>>

      expect(() => get(notABinding)).toThrowError('It looks like you are not passing a valid Binding<T> to get()')
    })
  })

  describe('when `get` handler is invoked with something that is not an Binding or Context', () => {
    it('should throw a useful error', () => {
      const notABindingNorContext = undefined as unknown as (Binding<BindingDescriptor<unknown>> | Context<unknown>)

      expect(() => free(notABindingNorContext)).toThrowError('It looks like you are not passing a valid Binding<T> or Context<T> to free()')
    })
  })
})
