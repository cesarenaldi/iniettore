/**
 * @flow
 */
import type { Binding } from 'types'

export default function createTraversingStack() {
  const stack: Set<Binding<any>> = new Set()
  const last = () => Array.from(stack.values())[stack.size - 1]

  return {
    push(binding: Binding<any>): void {
      if (stack.size) {
        last().addDependency(binding)
      }
      stack.add(binding)
    },

    pop(): void {
      stack.delete(last())
    },

    includes(binding: Binding<any>): boolean {
      return stack.has(binding)
    }
  }
}
