import { ContainerDescriptor, BindingDescriptor, ContextFrom } from '@iniettore/core/src/types'
import { container } from '@iniettore/core'

export function child<T extends ContainerDescriptor> (create: () => T): BindingDescriptor<ContextFrom<T>> {
  return {
    get () {
      return container(create)
    }
  }
}
