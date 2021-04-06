import { Binding, BindingDescriptor, Context } from '@iniettore/common'

function isObjectLike (value: unknown): value is Object {
  return typeof value === 'object' && value !== null
}

function hasBindingInterface (resource: {}): boolean {
  return [
    'addDependency',
    'acquire',
    'release',
    'dispose',
  ].every(method => typeof (resource as any)[method] === 'function')
}

function isBinding<T> (resource: Binding<BindingDescriptor<T>> | Context<unknown>): resource is Binding<BindingDescriptor<T>> {
  return isObjectLike(resource) && hasBindingInterface(resource)
}

export function get<T> (binding: Binding<BindingDescriptor<T>>): T {
  if (!isBinding(binding)) {
    throw new TypeError('It looks like you are not passing a valid Binding<T> to get()')
  }
  return binding.acquire()
}

export function free<T> (resource: Binding<BindingDescriptor<T>> | Context<any>): void {
  if (!isObjectLike(resource)) {
    throw new TypeError('It looks like you are not passing a valid Binding<T> or Context<T> to free()')
  }
  if (isBinding(resource)) {
    resource.release()
    return
  }
  const bindings = Object.values(resource)
  bindings.forEach(binding => {
    binding.dispose()
  })
}
