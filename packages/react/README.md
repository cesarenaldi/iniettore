# `@iniettore/react`

React bindings for [`iniettore`]('../iniettore/README.md)

`@iniettore/react` supports large React applications that makes use of code-splitting techniques to deliver code to their clients.

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

We will explain how to use `@iniettore/react` binding via an example. See below a quite typical `Logger` interface and a concrete implementation of it (i.e. `ConsoleLogger`).

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

Let's then assume you have a React `App` component and a component nested quite deep in the App render tree. We will call such component `MyNestedComponent`.

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

If you already using Iniettore you are probably familiar with the `container` function from the `iniettore` package. If not you can check the `iniettore` documentation [here](../iniettore/README.md).

The `container` function accepts a _describe_ callback that is meant to specify the Iniettore Context objects and their relationships.

`<Container />` accepts a _describe_ function which is similar to the one used to with the `container` function in the core library.


**modules.ts**
```typescript
import { singleton } from 'iniettore'
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

### Modular React applications

It's not uncommon for non-trivial React applications to make use of code-splitting and lazy loading techniques in order to optimize the way code is bundled and delivered to clients.

Let's use the example of an application that has been splitted into 3 application sub-modules. See components diagram below.



```ascii
                          ┌──────────────┐
                       ┌──┴─┐            │
                       └──┬─┘            │
                          │     Main     │
                       ┌──┴─┐            │
                       └──┬─┘            │
                          └───────┬──────┘
                                  │
                                  │
           ┌──────────────────────┼───────────────────────┐
           │                      │                       │
           │                      │                       │
   ┌───────┴──────┐       ┌───────┴──────┐        ┌───────┴──────┐
┌──┴─┐            │    ┌──┴─┐            │     ┌──┴─┐            │
└──┬─┘            │    └──┬─┘            │     └──┬─┘            │
   │  Component A │       │  Component B │        │  Component C │
┌──┴─┐            │    ┌──┴─┐            │     ┌──┴─┐            │
└──┬─┘            │    └──┬─┘            │     └──┬─┘            │
   └──────────────┘       └──────────────┘        └──────────────┘
```

`@iniettore/react` makes the job of wiring dependencies across application sub-modules as trivial as rendering a React component.

Let's assume that our hypothetical application has some logging constraints that require to have only one `Logger` object for the entire application. Such instance must be registered in the main Iniettore Context defined and injected in the `App` root component.

**main/modules.ts**
```typescript
import { singleton } from 'iniettore'
import ConsoleLogger from './ConsoleLogger'

export function describe () {
  return {
    logger: singleton(() => new ConsoleLogger())
  
    /* other bindings */
  }
}
```

**main/App.tsx**
```typescript
import React from 'react'
import { Container } from '@iniettore/react'
import { describe } from './modules'

export default function App () {
  return (
    <Container describe={describe}>
      { /* render logic eventually renders <ComponentA /> */ }
    </Container>
  )
}
```

Component A can be defined as a React component that uses Iniettore `<Container />` to define its own Iniettore Context for its internal wiring needs. The _describe_ function will receive a reference to the Iniettore Context injected by the `App` component.

**component-a/modules.ts**
```typescript
import { Context, singleton } from 'iniettore'
import Logger from '../Logger'
import HeroService from './HeroService'

export function describe (main: Context<{ logger: Logger }>) {
  return {
    hero: singleton(() => new HeroService(get(main.logger)))
  
    /* other bindings */
  }
}
```

**component-a/Root.tsx**
```typescript
import React from 'react'
import { describe } from './modules'

export default function Root () {
  return (
    <Container describe={describe}>
      { /* Component A components */ }
    </Container>  
  )
}
```
## License

[ISC](LICENSE)
