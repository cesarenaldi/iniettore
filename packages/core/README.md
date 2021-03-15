# `@iniettore/core`

Iniettore is a minimalistic Dependency Injection Container for JavaScript applications.

It's platform agnostic so it can be used on many platform running JS (e.g. Node.js, browsers, React Native).

**BREAKING CHANGES**
Iniettore v4 is a complete rewrite which comes with a brand new minimalistic interface. See [migration guide](../../migrating.md).

## Install

Using npm:

```bash
npm install @iniettore/core --save
```

Using Yarn:

```bash
yarn add @iniettore/core
```

## Basic Concepts

### Binding
A _binding_ in an opaque object responsible of managing the lifecycle of one of your instances. Iniettore makes no assumptions about the type or shape of the managed instance.

**Not just about objects.** In this documentation we will use the term _instance_ with the most generic meaning of the term. In other words you can replace _instance_ with _function_ and everything we describes here still applies.

Out of the box Iniettore provides 2 types of bindings:

- **Provider** bindings can be used in any scenario you want a **different instances** of your type to be "provided" when the corresponding dependency is requested.

- **Singleton** bindings can be used in all scenarios you need **only one instance** of the specified type to exist at any given point in time.

### Context

A _context_ is a glorified JS Object containings a collection of bindings. A context helps to structure your application in modular way by letting you group things that have a similiar lifecycle.

Iniettore contexts can be organized in a hierarchy so to accommodate different application composition needs.

## Getting Started

We will go over the fundamentals using an example. See below a typical dependency scenario.

```typescript

interface Logger {
  log(msg: string): void
}

class ConsoleLogger implements Logger {
  log(msg: string) {
    console.log(msg)
  }
}

class HeroService {
  constructor (readonly logger: Logger) {}

  fightBaddie () { /* ... */ }
}
```
We will instruct Iniettore to create a `HeroService` instance and provide a `ConsoleLogger` instance via constructor injection.


### Define the Context

You can define a _context_ with one _singleton_ of `Logger` and a _provider_ of `HeroService` where the first is a dependency of the latter.


```typescript
import { container, Context, get, singleton } from 'iniettore'

type CustomContext = Context<{ logger: Logger, hero: HeroService }>

const context: CustomContext = container(() => ({

  logger: singleton(() => new ConsoleLogger())

  hero: provider(() => new HeroService(get(context.logger)))
}))
```

  **WARNING** [v4 providers have different behaviour to pre-v4 providers] TBD

### Request instances

Requesting an instance of the `HeroService` will end up in creating an instance of the `ConsoleLogger` which will be provided to the `HeroService` constructor.

```typescript
const hero = get(context.hero)

hero instanceof HeroService // true
```

Two or more instances of the `HeroService` will share the same instance of the `ConsoleLogger`.

```typescript
const hero1 = get(context.hero)
const hero2 = get(context.hero)

hero1 === hero2 // false
hero1.logger === hero2.logger // true
```

### Free memory

When an instance is no longer needed we can tell iniettore via the `free` handler function.

```typescript
import { free } from 'iniettore'

const context = ...

let hero = get(context.hero)

// use hero here

hero = null
free(context.hero)
```
Any internal reference to the `ConsoleLogger` instance will be deleted so that the instance can be garbage collected.

**IMPORTANT:** It's developer responsability to notify Iniettore when an instance is no longer used.

## Guides

### Inject dependencies
TBD
### Context hierarchy
TBD
## API Reference

### `singleton(materialize [, dispose])`

Creates a _singleton_ binding.

Singleton bindings makes no assumptions about the way you create new instances.

**Parameters**

- `materialize: () => T` - a user defined function that returns instances of `T`
- `dispose: (T) => void` (optional) - a function that will be used to run bespoke dispose logic of the given instance.


**Returns**

`BindingDescriptor<T>` - an opaque object that describe how to manage the lifecycle of the singleton instance.

**Examples**

Using a constructor:
```typescript
import { container, singleton } from 'iniettore'

const context = container(() => ({
  createdAt: singleton(() => new Date())
}))
```

Using a factory function:
```typescript
import { container, singleton } from 'iniettore'

function createdAt() {
  return new Date()
}

const context = container(() => ({
  createdAt: singleton(createdAt)
}))
```

With a bespoke dispose logic:
```typescript
import { container, singleton } from 'iniettore'

class Car {
  start() { /* ... */ }
  stop() { /* ... */ }
}

const context = container(() => ({
  c: singleton(
    () => new Car(),
    car => car.stop()
  )
}))
```


### `provider(materialize)`

Creates a _provider_ binding.

Provider bindings are agnostic about the logic you use to provide an instance. This means you can create new instances with a factory function or you can leverage a pool of instances and implement your own reuse logic.

**Parameters**

- `materialize: () => T` - a user defined function that returns instances of `T`


**Returns**

`BindingDescriptor<T>` - an opaque object that describe how to manage the lifecycle of the provider instances.

**Examples**

Using a constructor:
```typescript
import { container, provider } from 'iniettore'

const context = container(() => ({
  createdAt: provider(() => new Date())
}))
```

Using a factory function:
```typescript
import { container, provider } from 'iniettore'

const context = container(() => ({
  now: provider(Date.now)
}))
```

### `container(describe)`

Creates a new _context_ with the bindings specified in the `describe` function.

**Parameters**

- `describe: () => { [string]: BindingDescriptor<unknown> }` - a user defined function that returns an object of `BindingDescriptor<T>`.

**Returns**

`{ [string]: Binding<BindingDescriptor<unknown>> }`

OR more conveniently:

`Context<{ [string]: unknown }>`

See [`Context` type](#context-type) later in this documentation.

**Example**

```typescript
import { container, singleton } from 'iniettore'

const context = container(() => ({
  now: singleton(() => new Date())
}))
```

### `get(binding)`

Materialize the `T` associated with the given `Binding<BindingDescriptor<T>>`. The `get` function works both on `singleton` and `provider` bindings. In fact the `get` function is agnostic about the lifecycle of the requested instance.

**Parameters**

- `binding: Binding<BindingDescriptor<T>>` - 


**Returns**

`T`

**Example**

```typescript
import { container, get, singleton } from 'iniettore'

const context = container(() => ({
  createdAt: singleton(() => new Date())
}))

const date = get(context.createdAt)
```

### `free(bindingOrContext)`

Notifies the binding that one of the consumers is no longer using one if its instance(s).

Each singleton binding has an internal counter that allows iniettore to keep track of the number of instances that depends on it. When a singleton binding internal counter reaches zero, the binding clears any internal reference to the instance so it can be garbage collected propertly. A custom dispose logic could also be specified before the references gets cleared (see `singleton`).

Iniettore is able to figure out what singletons can be freed in the case of simple, direct dependencies (like in the `HeroService -> ConsoleLogger` example above) and also in more complex scnearios where the web of dependencies involves  several "binding hops". This works even in the case some of the bindings in between are not singleton bindings.

**Parameters**

- `bindingOrContext: Binding<unknown> | Context<{ [string]: unknown }>` - a `Binding<T>` object or an entire `Context<T>`.

**Examples**

Using a binding:
```typescript
import { container, get, singleton } from 'iniettore'

const context = container(() => ({
  createdAt: singleton(() => new Date())
}))

let date = get(context.createdAt)

data = null
free(context.createdAt)
```

Using a context all the binding within context will be notified and disposed accordingly:
```typescript
import { container, get, singleton } from 'iniettore'

const context = container(() => ({
  createdAt: singleton(() => new Date())
}))

let date = get(context.createdAt)

data = null
free(context)
```

### `Context` type

`Context` is a convenient TS Generic Object type that helps declaring the shape of an Iniettore Context.

In any non-trivial usage of Iniettore, the `Context` is used to define the shape of an Iniettore Context so to be able to declare dependencies within the context itself (see [Getting Started](#getting-started)).

#### `Context` and ISP

The [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle) (ISP) is one of the five [SOLID](https://en.wikipedia.org/wiki/SOLID) principles of object-oriented programming. For the purpose of this documentation we will just use the following operational definition of ISP.

> The ISP advises us not to depend on classes that have methods we don't use. - Clean Architecture (Robert C. Martin)

As an application grows sometimes it's wise to break it down into application modules that have clear boundaries with the main application. In some Computer Science literatures these modules are referred to as Components depending on how these are deployed/packaged. See an example components diagram that visualize this.

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

Each component has it's own objects and it's own internal dependency needs.

It is possible to have one single Iniettore Context that defines all dependencies between indidual components objects. As an application grow it might become quite difficult to manage all such composition logic in one place.

One might need to break down the composition logic into a main application Context and one sub-Context per component.

Iniettore facilitate this by letting the developer create different Iniettore contexts where the individual component composition is defined and segregated.

Using the components diagram above and the `Logger`, `ConsoleLogger` and `HeroService` types [defined at the beginning](#getting-started) we can explain this with an example.

Let's assume that our hypothetical application has some logging constraints that require to have only one `Logger` object for the entire application. Such instance must be registered in the main Iniettore Context.

**main**
```typescript
type MainContext = Context<{ logger: Logger, hero: HeroService }>

const mainContext: MainContext = container(() => ({

  logger: singleton(() => new ConsoleLogger())

  hero: provider(() => new HeroService(get(context.logger)))

  /* other bindings */
}))
```

Let's now assume that Component A needs to log something. Let's also make clear that Component A does NOT need `HeroService`.

One can use the `Context` generic type to isolate the portion of the main Iniettore Context needed by Component A.

**RequireLoggerContext**
```typescript
type RequireLoggerContext = Context<{ logger: Logger }>
```

**component-a**
```typescript


function init(main: RequireLoggerContext) {
  const componentContext: CustomContext = container(() => ({
  
    hero: singleton(() => new HeroService(get(main.logger)))
  
    /* other bindings */
  }))

  /* ... */
}
```

The example above uses an hypothetical init function to initialize the component. This is not meant to prescribe any specific solution. It just helps with explaining how to use `Context` generic type to follow the ISP.


