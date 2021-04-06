import React, { useContext as useReactContext, useEffect, useMemo, useRef } from 'react'
import { container, free, get } from 'iniettore'
import { Context, ContainerDescriptor } from '@iniettore/common'

const hasOwnProperty = Object.prototype.hasOwnProperty
const root = {}
const IniettoreContext = React.createContext<Context<{}>>(root)

interface ContextProviderProps<T> {
  children: React.ReactNode,
  context: Context<T>
}

export function ContextProvider<T extends {}>({ children, context }: ContextProviderProps<T>) {
  return (
    <IniettoreContext.Provider value={context}>
      {children}
    </IniettoreContext.Provider>
  )
}

function useIniettoreContext<T> (): Context<T> {
  return useReactContext(IniettoreContext) as Context<T>
}

interface ContainerProps<C, P> {
  children: React.ReactNode,
  describe: (parent: Context<P>) => ContainerDescriptor<C>
}

export function Container<C extends {}, P extends {}> ({ children, describe }: ContainerProps<C, P>) {
  const parent = useIniettoreContext<P>()
  const context = useRef(container(() => describe(parent))).current

  return (
    <ContextProvider context={context}>
      {children}
    </ContextProvider>
  )
}


export function useContext<T extends { [name: string]: unknown }>(): T {
  const ctx = useIniettoreContext<T>()
  const cache = useRef({} as { [name: string]: unknown }).current

  const proxy = useMemo(() => new Proxy({} as T, {
    get(_, prop: string) {
      if (prop in cache) {
        return cache[prop]
      }
      const instance = get(ctx[prop])
      cache[prop] = instance
      return instance
    }
  }), [ctx])

  useEffect(() => {
    return () => {
      for (const name in cache) {
        if (hasOwnProperty.call(cache, name)) {
          free(ctx[name])
        }
      }
    }
  }, [])

  return proxy
}
