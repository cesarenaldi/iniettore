import { Binding, BindingDescriptor } from '@iniettore/common'
import lowPriorityWarning from './lowPriorityWarning'
import createTraversingStack from './createTraversingStack'
import { free } from './handlers'

const traversingStack = createTraversingStack()

function clearDependencies (dependencies: Array<Binding<any>>): Array<Binding<any>> {
  dependencies.map(free)
  return []
}

function createBinding<T> (name: string, descriptor: BindingDescriptor<T>): Binding<BindingDescriptor<T>> {
  let dependencies: Array<Binding<any>> = []
  let dependents = 0

  return {
    addDependency<T> (binding: Binding<BindingDescriptor<T>>): void {
      dependencies.push(binding)
    },

    acquire (): T {
      if (traversingStack.includes(this)) {
        throw new Error(`Circular dependency detected while resolving '${name}'`)
      }
      traversingStack.push(this)
      const instance = descriptor.get()
      traversingStack.pop()
      dependents++
      return instance
    },

    release () {
      dependents--
      dependencies = clearDependencies(dependencies)
      if (descriptor.free) {
        descriptor.free(dependents)
      }
    },

    dispose () {
      dependencies = clearDependencies(dependencies)
      lowPriorityWarning(dependents > 0, `Binding ${name} disposed with potentially ${dependents} dependends`)
      dependents = 0
      if (descriptor.destroy) {
        descriptor.destroy()
      }
    }
  }
}

export default createBinding
