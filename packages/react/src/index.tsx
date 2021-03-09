import React, { useContext as useReactContext } from 'react'
import { ContextFrom, Context, ContainerDescriptor } from '@iniettore/common'

const IniettoreContext = React.createContext<Context<{}> | null>(null)

interface ProviderProps<T extends ContainerDescriptor> {
  children: React.ReactNode,
  context: ContextFrom<T>
}

export const ContextProvider = <T extends ContainerDescriptor>({ children, context }: ProviderProps<T>) => (
  <IniettoreContext.Provider value={context}>
    {children}
  </IniettoreContext.Provider>
)

export function useContext<T> (): Context<T> {
  const ctx = useReactContext(IniettoreContext) as Context<T>

  if (ctx === null) {
    throw new Error(
      'Could not find an Iniettore Context in the React context. Wrap the root component in an Iniettore <Provider>'
    )
  }
  return ctx
}
