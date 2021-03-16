import React, { useContext as useReactContext, useRef } from 'react'
import { container } from 'iniettore'
import { Context, ContainerDescriptor } from '@iniettore/common'

const root = {}
const IniettoreContext = React.createContext<Context<{}>>(root)

interface ContextProviderProps<C, P> {
  children: React.ReactNode,
  describe: (parent: Context<P>) => ContainerDescriptor<C>
}

export function useContext<T> (): Context<T> {
  return useReactContext(IniettoreContext) as Context<T>
}

export function Container<C extends {}, P extends {}> ({ children, describe }: ContextProviderProps<C, P>) {
  const parent = useContext<P>()
  const context = useRef(container(() => describe(parent))).current

  return (
    <IniettoreContext.Provider value={context}>
      {children}
    </IniettoreContext.Provider>
  )
}
