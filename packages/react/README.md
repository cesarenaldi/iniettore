# `@iniettore/react`

React bindings for [Iniettore]('../core/README.md)

## Install

Using npm:

```bash
npm install @iniettore/react --save
```

Using Yarn:

```bash
yarn add @iniettore/react
```
## Usage

We will explain how to use `@iniettore/react` binding using an example. See below a typical `Logger` interface and a concrete implementation of it (i.e. `ConsoleLogger`).

**Logger.ts**
```typescript
export default interface Logger {
  log(msg: string): void
}
```
**ConsoleLogger.ts**
```typescript
import Logger from './Logger'

class ConsoleLogger implements Logger {
  log(msg: string) {
      console.log(msg)
  }
}
```

Let's then assume you have a React `App` component and a component nested quite deep in the App render tree, we will call such component `MyNestedComponent`.

For the purpose of this example we will assume `MyNestedComponent` needs to log something very important on its first render.

**App.tsx**
```typescript
import React from 'react'

export default function App () {
  return (
    { /* my app components */ }
  )
}
```
**MyNestedComponent.tsx**
```typescript
import React, { useEffect } from 'react'

export default function MyNestedComponent () {
  useEffect(() => {
    // needs to log something
  }, [])

  return (
    /* my component render tree */  
  )
}
```

One can define an Iniettore Context associated with the `App` component by using the `@iniettore/react` `<Container />` component.

**App.tsx**
```typescript
import React from 'react'
import { Container } from '@iniettore/react'
import { describe } from './modules'

export default function App () {
  return (
    <Container describe={describe}>
      { /* my app components */ }
    </Container>
  )
}
```

If you already using Iniettore you are probably familiar with the `container` function in the `@iniettore/core` package. If not check `@iniettore/core` documentation [here](../core/README.md).

The `container` function accepts a _describe_ callback that is meant to specify the Iniettore Context objects and their relationships.

`<Container />` accepts a _describe_ function which is similar to the one used to with the `container` function in the core library.


**modules.ts**
```typescript
import { singleton } from '@iniettore/core'
import ConsoleLogger from './ConsoleLogger'

export function describe () {
  return {
    logger: singleton(() => new ConsoleLogger())
  }
}
```

The `MyNestedComponent` can then access the concrete instance of `Logger` with the Iniettore `useContext` React hook.

**MyNestedComponent.tsx**
```typescript
import React, { useEffect } from 'react'
import { useContext as useIniettoreContext } from '@iniettore/react'
import Logger from './Logger'

export default function MyNestedComponent () {
  const { logger } = useIniettoreContext<{ logger: Logger }>()

  useEffect(() => {
    logger.log('I made it!')
  }, [])

  return (
    /* my component render tree */  
  )
}
```
## License

[ISC](LICENSE)
