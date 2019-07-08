/**
 * @flow
 */

export type BindingDescriptor<T> = {|
  get: () => T,
  free?: (dependents: number) => void,
  destroy?: () => void
|}

export type Binding<T> = {|
  // name: string,
  // dependencies: Array<Binding<any>>,
  addDependency: (Binding<any>) => void,
  acquire: () => T,
  release: () => void,
  dispose: () => void
|}

type ConvertToBinding = <T>(BindingDescriptor<T>) => Binding<T>
export type Context<T> = $ObjMap<T, ConvertToBinding>
