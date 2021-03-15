import { Binding, BindingDescriptor, Context } from '@iniettore/common'

export function get<T> (binding: Binding<BindingDescriptor<T>>): T {
  return binding.acquire()
}

function isBinding (resource: Binding<any> | Context<any>): resource is Binding<any> {
  return 'release' in resource
}

export function free<T> (resource: Binding<BindingDescriptor<T>> | Context<any>): void {
  if (isBinding(resource)) {
    resource.release()
    return
  }
  const bindings = Object.values(resource)
  bindings.forEach(binding => {
    binding.dispose()
  })
}
