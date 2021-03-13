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
**logs.ts**
```typescript
export interface Logger {
  log(msg: string): void
}
```
**ConsoleLogger.ts**
```typescript
import { Logger } from './logs'

class ConsoleLogger implements Logger {
  log(msg: string) {
      console.log(msg)
  }
}
```
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
**App.tsx**
```typescript
import React from 'react'
import { Container as IniettoreContext } from '@iniettore/react'
import { describe } from './modules'

export default function App () {
  return (
    <IniettoreContext describe={describe}>
      { /* my app components */ }
    </IniettoreContext>
  )
}
```
**MyNestedComponent.tsx**
```typescript
import React, { useEffect } from 'react'
import { useContext as useIniettoreContext } from '@iniettore/react'
import { Logger } from './logs'

export default function MyNestedComponent () {
  const { logger } = useIniettoreContext<{ logger: Logger }>()

  useEffect(() => {
    logger.log('MyNestedComponent mounted')
  }, [])

  return (
    /* my component render tree */  
  )
}
```
## License

[ISC](LICENSE)
