/**
 * @flow
 */

import { free } from './handlers'
import type { BindingDescriptor } from 'types'

export function provider<T>(func: () => T): BindingDescriptor<T> {
  return {
    get: func
  }
}

export function singleton<T>(func: () => T): BindingDescriptor<T> {
  let instance

  return {
    get() {
      if (typeof instance === 'undefined') {
        instance = func.call(null)
      }
      return instance
    },
    free(dependents) {
      if (dependents === 0) {
        this.destroy()
      }
    },
    destroy() {
      instance = undefined
    }
  }
}
