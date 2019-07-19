/**
 * @flow
 */
import type { Binding, BindingDescriptor, Context } from 'types'
import lowPriorityWarning from '../../shared/lowPriorityWarning'
import createTraversingStack from './createTraversingStack'
import { free } from './handlers'

function createBinding<T>(name: string, descriptor: BindingDescriptor<T>): Binding<T> {
  const dependencies = []
  let dependents = 0

  return {
    addDependency<T>(binding: Binding<T>): void {
      dependencies.push(binding)
    },

    acquire(): T {
      if (traversingStack.includes(this)) {
        throw new Error(`Circular dependency detected while resolving '${name}'`)
      }
      traversingStack.push(this)
      const instance = descriptor.get()
      traversingStack.pop()
      dependents++
      return instance
    },

    release() {
      dependents--
      dependencies.map(free) // to be fixed, 2+ iterations and it will pollute massively
      if (descriptor.free) {
        descriptor.free(dependents)
      }
    },

    dispose() {
      dependencies.map(free) // to be fixed, 2+ iterations and it will pollute massivelys
      lowPriorityWarning(dependents > 0, `Binding ${name} disposed with potentially ${dependents} dependends`)
      dependents = 0
      if (descriptor.destroy) {
        descriptor.destroy()
      }
    }
  }
}

const traversingStack = createTraversingStack()

export default createBinding
