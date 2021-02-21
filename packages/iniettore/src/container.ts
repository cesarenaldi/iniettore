import createBinding from './createBinding'

import { ContainerDescriptor, Context } from '../../shared/types'

const hasOwnProperty = Object.prototype.hasOwnProperty

export default function container<T extends ContainerDescriptor> (describeContainer: () => T): Context<T> {
  const descriptors = describeContainer()

  const n = {} as Context<T>
  for (const k in descriptors) {
    if (hasOwnProperty.call(descriptors, k)) {
      n[k] = createBinding(k, descriptors[k])
    }
  }
  return n
}
