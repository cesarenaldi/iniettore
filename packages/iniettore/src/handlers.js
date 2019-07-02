/**
 * @flow
 */
import type { Binding } from './types'

export function get<T>(binding: Binding<T>): T {
  return binding.acquire()
}

export function free<T>(binding: Binding<T>) {
  return binding.release()
}
