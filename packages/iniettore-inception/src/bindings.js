/**
 * @flow
 */
import type { Context, BindingDescriptor } from 'types'

export function child<O: {}>(func: () => Context<O>): BindingDescriptor<Context<O>> {
  return {
    get: func
  }
}
