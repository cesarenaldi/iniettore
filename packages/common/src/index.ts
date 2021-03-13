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

export type ContainerDescriptor<T extends {}> = {
  [K in keyof T]: BindingDescriptor<T[K]>
}

export type Context<T> = {[K in keyof ContainerDescriptor<T>]: Binding<ContainerDescriptor<T>[K]>}
