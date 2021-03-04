import React from 'react'
import { ContextFrom, ContainerDescriptor } from '@iniettore/common'

export const IniettoreContext = React.createContext<ContextFrom<ContainerDescriptor> | null>(null)

interface ProviderProps<T extends ContainerDescriptor> {
  children: React.ReactNode,
  context: ContextFrom<T>
}

export const Provider = <T extends ContainerDescriptor>({ children, context }: ProviderProps<T>) => (
  <IniettoreContext.Provider value={context}>
    {children}
  </IniettoreContext.Provider>
)
