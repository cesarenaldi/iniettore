/**
 * @flow
 */
import { free } from './handlers'
import type { Binding, BindingDescriptor } from './types'

function createBinding<T>(name: string, descriptor: BindingDescriptor<T>): Binding<T> {
  return {
    name,

    dependencies: [],

    addDependency<T>(binding: Binding<T>): void {
      this.dependencies.push(binding)
    },

    acquire(): T {
      traversingStack[traversingStack.length - 1].addDependency(this)
      traversingStack.push(this)
      const instance = descriptor.get()
      traversingStack.pop()
      return instance
    },

    release() {
      this.dependencies.map(free)
      descriptor.free()
    }
  }
}

const rootBinding = createBinding('__root__', { get() {}, free() {} })
const traversingStack = [rootBinding]

export default createBinding
