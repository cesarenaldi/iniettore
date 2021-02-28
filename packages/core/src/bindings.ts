import { BindingDescriptor } from './types'

const noop = () => undefined

export function provider<T> (func: () => T): BindingDescriptor<T> {
  return {
    get: func
  }
}

export function singleton<T> (materialize: () => T, dispose: (t: T) => void = noop): BindingDescriptor<T> {
  let instance: T | undefined

  function destroy () {
    if (instance) {
      dispose(instance)
      instance = undefined
    }
  }

  return {
    get () {
      if (instance === undefined) {
        instance = materialize()
      }
      return instance
    },
    free (dependents: number) {
      if (dependents === 0) {
        destroy()
      }
    },
    destroy
  }
}
