import { ContainerDescriptor, ContextFrom } from '@iniettore/common'
import createBinding from './createBinding'

const hasOwnProperty = Object.prototype.hasOwnProperty

export default function container<T extends ContainerDescriptor> (describe: () => T): ContextFrom<T> {
  const descriptors = describe()

  const ctx = {} as ContextFrom<T>
  for (const name in descriptors) {
    /* istanbul ignore else */
    if (hasOwnProperty.call(descriptors, name)) {
      ctx[name] = createBinding(name, descriptors[name])
    }
  }
  return ctx
}
