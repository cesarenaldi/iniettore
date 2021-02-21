import createBinding from './createBinding'

import { ContainerDescriptor, Context } from '../../shared/types'

export default function container<T extends ContainerDescriptor, K extends keyof T>(describeContainer: () => T): Context<T> {
  const descriptors = describeContainer()

  const n = {} as Context<T>
  for (let k in descriptors) {
      if (descriptors.hasOwnProperty(k)) {
          n[k] = createBinding(k, descriptors[k])
      }
  }
  return n
}
