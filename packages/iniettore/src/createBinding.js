/**
 * @flow
 */
import { free } from './handlers'
import type { Binding, BindingDescriptor } from 'types'

function createBinding<T>(name: string, descriptor: BindingDescriptor<T>): Binding<T> {
  const dependencies = []
  let dependents = 0

  return {
    addDependency<T>(binding: Binding<T>): void {
      dependencies.push(binding)
    },

    acquire(): T {
      traversingStack[traversingStack.length - 1].addDependency(this)
      traversingStack.push(this)
      const instance = descriptor.get()
      traversingStack.pop()
      dependents++
      return instance
    },

    release() {
      dependents--
      dependencies.map(free)
      if (descriptor.free) {
        descriptor.free(dependents)
      }
    },

    dispose() {
      dependents = 0
      dependencies.map(free)
      if (descriptor.destroy) {
        descriptor.destroy()
      }
    }
  }
}

const rootBinding = createBinding('__root__', { get() {} })
const traversingStack = [rootBinding]

export default createBinding
