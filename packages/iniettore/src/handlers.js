/**
 * @flow
 */
import type { Binding, Context } from 'types'

export function get<T>(binding: Binding<T>): T {
  return binding.acquire()
}

export function free<T>(resource: Binding<T> | Context<Object>): void {
  if ('release' in resource) {
    resource.release()
    return
  }
  const bindings = ((Object.values(resource): any): Array<Binding<any>>)
  bindings.map(binding => {
    binding.dispose()
  })
}
