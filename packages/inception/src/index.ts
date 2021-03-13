import { ContainerDescriptor, BindingDescriptor, Context } from '@iniettore/common'
import { container } from '@iniettore/core'

export function child<T extends ContainerDescriptor<T>> (create: () => T): BindingDescriptor<Context<T>> {
  return {
    get () {
      return container(create)
    }
  }
}
