/**
 * @flow
 */
import createBinding from './createBinding'

import type { Binding, BindingDescriptor, Context } from 'types'

export default function<O: {}>(contextFactory: () => O): Context<O> {
  const descriptors = contextFactory()

  // https://github.com/facebook/flow/issues/2221 and cry with me!
  const entries = ((Object.entries(descriptors): any): Array<[string, BindingDescriptor<any>]>)

  return entries.reduce((ctx, [name, descriptor]) => {
    ctx[name] = createBinding(name, descriptor)
    return ctx
  }, {})
}
