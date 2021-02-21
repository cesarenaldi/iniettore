import { free } from './handlers'
import { BindingDescriptor } from '../../shared/types'

const noop = (T: any) => void 0

export function provider<T>(func: () => T): BindingDescriptor<T> {
  return {
    get: func
  }
}

export function singleton<T>(materialize: () => T, dispose: (T) => void = noop): BindingDescriptor<T> {
  let instance: T

  return {
    get() {
      if (typeof instance === 'undefined') {
        instance = materialize.call(null)
      }
      return instance
    },
    free(dependents) {
      if (dependents === 0) {
        this.destroy()
      }
    },
    destroy() {
      if (instance) {
        dispose(instance)
        instance = undefined
      }
    }
  }
}
