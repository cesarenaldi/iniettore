/**
 * @flow
 */

export type BindingDescriptor<T> = {|
  get: () => T,
  free: () => void
|}

export type Binding<T> = {|
  name: string,
  dependencies: Array<Binding<any>>,
  addDependency: (Binding<any>) => void,
  acquire: () => T,
  release: () => void
|}
