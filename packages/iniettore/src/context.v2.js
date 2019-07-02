/**
 * @flow
 */
import createBinding from './createBinding'

import type { Binding, BindingDescriptor } from './types'

type ConvertToBinding = <T>(BindingDescriptor<T>) => Binding<T>

export default function<O: {}>(contextFactory: () => O): $ObjMap<O, ConvertToBinding> {
  const ctx = contextFactory()

  // https://github.com/facebook/flow/issues/2221 and cry with me!
  const bindings = ((Object.entries(ctx): any): Array<[string, BindingDescriptor<any>]>)

  return bindings.reduce((ctx, [name, descriptor]) => {
    ctx[name] = createBinding(name, descriptor)
    return ctx
  }, {})
}
