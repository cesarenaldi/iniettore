export type BindingDescriptor<T> = {
  get: () => T,
  free?: (dependents: number) => void,
  destroy?: () => void
}

type UnspecifiedBindingDescriptor = BindingDescriptor<unknown>

export type Binding<T extends UnspecifiedBindingDescriptor> = {
  addDependency: (binding: Binding<any>) => void,
  acquire: () => T extends BindingDescriptor<infer R> ? R : never,
  release: () => void,
  dispose: () => void
}

export type ContainerDescriptor = {
  [name:string]: BindingDescriptor<unknown>
}

export type Context<T extends ContainerDescriptor> = { [K in keyof T]: Binding<T[K]> }
