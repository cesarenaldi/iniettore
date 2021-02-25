import { ContainerDescriptor, ContextFrom } from './types'
import createBinding from './createBinding'

const hasOwnProperty = Object.prototype.hasOwnProperty

export default function container<T extends ContainerDescriptor> (describe: () => T): ContextFrom<T> {
  const descriptors = describe()

  const ctx = {} as ContextFrom<T>
  for (const name in descriptors) {
    if (hasOwnProperty.call(descriptors, name)) {
      ctx[name] = createBinding(name, descriptors[name])
    }
  }
  return ctx
}
