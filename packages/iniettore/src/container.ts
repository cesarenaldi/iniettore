import { ContainerDescriptor, Context } from './types'
import createBinding from './createBinding'

const hasOwnProperty = Object.prototype.hasOwnProperty

export default function container<T extends ContainerDescriptor> (describeContainer: () => T): Context<T> {
  const descriptors = describeContainer()

  const ctx = {} as Context<T>
  for (const name in descriptors) {
    if (hasOwnProperty.call(descriptors, name)) {
      ctx[name] = createBinding(name, descriptors[name])
    }
  }
  return ctx
}
