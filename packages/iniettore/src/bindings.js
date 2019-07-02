/**
 * @flow
 */

import { free } from './handlers'
import type { BindingDescriptor } from './types'

const noop = () => void 0

export function provider<T>(func: () => T): BindingDescriptor<T> {
  return {
    get: func,
    free: noop
  }
}

export function singleton<T>(func: () => T): BindingDescriptor<T> {
  let count = 0
  let instance

  return {
    get() {
      if (typeof instance === 'undefined') {
        instance = func.call(null)
      }

      count++
      return instance
    },
    free() {
      count--
      if (count == 0) {
        instance = undefined
      }
    }
  }
}
