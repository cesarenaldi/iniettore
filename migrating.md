# Migrating to v4

If you have an usage of Iniettore pre-v4 that is not covered by the documentation below, feel free to open an issue with an example that explain your use case and I will be happy to provide some suggestions on how to port it to use v4 API.

- [Values and Instances](#values-and-instances)
- [Functions](#functions)
- [Providers and Constructors](#providers-and-constructors)
- [Child contexts](#child-contexts)
- [Blueprints](#blueprints)
- [Transient dependencies](#transient-dependencies)
- [Singletons](#singletons)
- [Dispose singletons](#dispose-singletons)
- [Dispose a whole Iniettore Context](#dispose-a-whole-iniettore-context)
## Values and Instances
### Before
In pre-v4 versions one doulc define a binding for a value and instance types like so:

```javascript
import iniettore from 'iniettore'
import { VALUE, INSTANCE } from 'iniettore'

const drone = {
  fly: function() {
    /*...*/
  }
}

const rootContext = iniettore.create(function(map) {
  map('answer')
    .to(42)
    .as(VALUE)
  map('drone')
    .to(drone)
    .as(INSTANCE)
})
```

There is no difference between `VALUE` and `INSTANCE`. The reason to have 2 different flags was just to provide better semantic when reading the mappings.

This was a quirk of the previous interface. **With iniettore v4 it's not longer necessary to register values into the context.**

### After
If you need to inject a value or an instance just pass them to them in into your constructors or factory functions:


```typescript
import { get, container } from 'iniettore'

const ANSWER = 42

class Question {
  constructor (answer: number) { /* ... */ }
}

const context = container(() => {

  question: provider(() => new Question(ANSWER)),

  drone
})
```

Alternatively you can use provider ans singleton bindings like in the example below:

```typescript
import { get, container } from 'iniettore'

const ANSWER = 42

const drone = {
  fly: function() {
    /*...*/
  }
}

const context = container(() => {

  answer: provider(() => ANSWER),

  drone: singleton(() => drone),
})
```

## Functions
### Before

In pre-v4 it was possible to define a mapping as a function. When also dependencies were specified this would have resulted in a [partial application](https://en.wikipedia.org/wiki/Partial_application) being registered into the context.

```javascript
import iniettore from 'iniettore'
import { VALUE, FUNCTION } from 'iniettore'

function fooFunction(bar, baz) {
  console.log(bar, baz)
}

const rootContext = iniettore.create(function(map) {
  map('bar')
    .to('BAR')
    .as(VALUE)
  map('foo')
    .to(fooFunction)
    .as(FUNCTION)
    .injecting('bar')
})

const foo = rootContext.get('foo') // foo is a partial application of the original function

foo(42) // BAR, 42
```

### After

The simplified interface of iniettore v4 gives all the freedom one need to achieve the same without having to require special treatments.

```typescript
import { container, get, provider } from 'iniettore'

function fooFunction(bar, baz) {
  console.log(bar, baz)
}

const context = container(() => ({
  bar: provider(() => 42),

  foo: provider(() => fooFunction.bind(null, get(context.bar)))
}))

```

In the example above we use `Function.prototype.bind` to perfom a partial application of the provided function but feel free to use any other technique you are confident with.

## Providers and Constructors
### Before
In pre-v4 there was a clear distinction between provider functions and 
constructors. It was iniettore responsibility to invoke providers and to instantiate constructors (i.e. use `new` operator).

```javascript
import iniettore from 'iniettore'
import { CONSTRUCTOR, PROVIDER } from 'iniettore'

class Bar {}

let idx = 0
function fooProvider() {
  return {
    idx: ++idx
  }
}

const rootContext = iniettore.create(function(map) {
  map('bar')
    .to(Bar)
    .as(CONSTRUCTOR)

  map('foo')
    .to(fooProvider)
    .as(PROVIDER)
})
```

### After

Use the _provider_ binding if you need a new instance every time the binding is requested.

```typescript
import { container, provider } from 'iniettore'

class Bar {}

let idx = 0
function factory() {
  return {
    idx: ++idx
  }
}

var context = container(() => ({
  item: provider(factory),

  bar: provider(() => new Bar())
}))
```

Use the _singleton_ binding if you need only one instance to exist regardless of how many times it's requested.

```typescript
import { container, singleton } from 'iniettore'

class Bar {}

let idx = 0
function factory() {
  return {
    idx: ++idx
  }
}

var context = container(() => ({
  item: singleton(factory),

  bar: singleton(() => new Bar())
}))
```
## Child contexts
### Before

Iniettore pre-v4 had an explicit way to create a context hierarchy. This was achieved via the `context.createChild(fn)`.

Child contexts used to serve two purposes:
- let a child context inherit mappings defined in their parent context.
- bind the lifecycle of a child context to the lifecycle of their parent context. If the parent context were to be destroyed, the child context would have been destroyed as well.

**NOTE:** This second aspect was poorly documented so there is a chance you might not have taken advantage of it in your usage of Iniettore.

A typical usage of Child contexts in pre-v4 could have looked like the following example.

```javascript
import iniettore from 'iniettore'
import { VALUE, PROVIDER } from 'iniettore'

function fooProvider(bar, baz) {
  return { bar, baz }
}

var rootContext = iniettore.create(function(map) {
  map('bar')
    .to(42)
    .as(VALUE)
  map('baz')
    .to('pluto')
    .as(VALUE)
})
var childContext = rootContext.createChild(function(map) {
  map('bar')
    .to(84)
    .as(VALUE) // this will shadow the rootContext mapping
  map('foo')
    .to(fooProvider)
    .as(PROVIDER)
    .injecting('bar', 'baz')
})

console.log(rootContext.get('bar')) // 42
console.log(childContext.get('bar')) // 84
console.log(childContext.get('foo')) // { bar: 84, baz: 'pluto' }
```

### After

Iniettore v4 does NOT have an explicit method/function to create child contexts. Because of this the developer does have more options in the way they decide to organize their dependencies. See few examples below.

#### Consume parent dependencies

```typescript
import { container, Context, singleton, provider } from 'iniettore'

const appContext = container(() => ({
  logger: singleton(() => new ConsoleLogger())
}))

const requestContext = container(() => ({
  hero: provider(() => new HeroService(get(appContext.logger)))
}))

```

#### Child context factory

The example below shows hot it's possible to create a _contexts provider_ with bindings that depends on the parent context bindings.

```typescript
import { container, Context, get, free, singleton, provider } from 'iniettore'

type AppContext = Context<{ logger: Logger, requestContext: Context<unknown> }>

const appContext: AppContext = container(() => ({
  logger: singleton(() => new ConsoleLogger()),

  requestContext: provider(() => createRequestContext(appContext))
}))

function createRequestContext(appContext: AppContext) {
  return container(() => ({
    hero: provider(() => new HeroService(get(appContext.logger)))
  }))
}

// Example usage:
const requestContext = get(appContext.requestContext)

// use requestContext

free(appContext.requestContext)
```

#### Singleton child context

```typescript
import { container, Context, get, free, singleton } from 'iniettore'

type AppContext = Context<{ logger: Logger, requestContext: Context<unknown> }>

const appContext: AppContext = container(() => ({
  logger: singleton(() => new ConsoleLogger()),

  heroSectionContext: singleton(
    () => createHeroSectionContext(appContext),

    // NOTE: We use the singleton binding 2nd callback
    // to clear the child context when no longer needed
    heroSectionContext => free(heroSectionContext)
  )
}))

function createHeroSectionContext(appContext: AppContext) {
  return container(() => ({
    hero: provider(() => new HeroService(get(appContext.logger)))
  }))
}

// Example usage:
const heroSectionContext = get(appContext.heroSectionContext)

// use heroSectionContext

free(appContext.heroSectionContext)
```

## Blueprints

### Before

Blueprint was **a convenient way to register a child context factory** in Iniettore pre-v4. The mapping value was the configuration function for the child context. Every time a blueprint mapping was requested a new child context was created.

```javascript
import iniettore from 'iniettore'
import { VALUE, BLUEPRINT } from 'iniettore'

function configureChildContext(map) {
  map('baz')
    .to('pluto')
    .as(VALUE)
}

var rootContext = iniettore.create(function(map) {
  map('bar')
    .to(42)
    .as(VALUE)
  map('foo')
    .to(configureChildContext)
    .as(BLUEPRINT)
})

var childContext = rootContext.get('foo')

console.log(childContext.get('bar')) // 42
console.log(childContext.get('baz')) // pluto
```

### After

Iniettore v4 does not have special method/functions to define child context factory.
The careful reader might have noticed that in a previous example we already shown how to create a child context factory using `provider` and `container`. See [here](#child-context-factory).
### What about Blueprint `exports`?

Some might remember that in pre-v4 it was possible to create a Blueprint and declare which binding was the "main export" of the created child contexts. See example below as a refresher.

```javascript
import iniettore from 'iniettore'
import { VALUE, FUNCTION, BLUEPRINT } from 'iniettore'

function baz(bar) {
  console.log(bar)
}

function configureChildContext(map) {
  map('baz')
    .to(baz)
    .as(FUNCTION)
    .injecting('bar')
}

var rootContext = iniettore.create(function(map) {
  map('bar')
    .to(42)
    .as(VALUE)
  map('foo')
    .to(configureChildContext)
    .as(BLUEPRINT)
    .exports('baz')
})

var baz = rootContext.get('foo')

console.log(baz()) // 42
```

This was going conflicting the hierarchical nature of iniettore contexts. A child context could know about some parent context bindings but the opposite was not desirable. The Blueprint `exports` was kinda introducing a logical dependency between the parent context and the details of the child context. This because one must know the name of the child context binding to export in the definition of the parent context blueprint binding.

Iniettore v4 does not provide special methods/functions to create a Blueprint, so it should not be with a surprise that it's not possible to define a "default export" of a child context.

Said that, one could still achieve something very close to it. See example below.


```typescript
import { container, Context, get, free, singleton, provider } from 'iniettore'

type RequestHandler = (req: Request, res: response) => void

function requestHandler(hero: HeroService, req: Request, res: Response): void { /* ... */ }

type ReqContext = Context<{ hero: HeroService, requestContext: Context<unknown> }>

function createRequestHandler(appContext: AppContext): RequestHandler {
  const requestContext: ReqContext = container(() => ({
    hero: provider(() => new HeroService(get(appContext.logger))),

    handler: provider(() => requestHandler.bind(null, get(requestContext.hero)))
  }))

  // akin to pre-v4 blueprint exports
  return get(requestContext.handler)
}



type AppContext = Context<{ logger: Logger, requestHandler: RequestHandler }>

const appContext: AppContext = container(() => ({
  logger: singleton(() => new ConsoleLogger()),

  requestHandler: provider(() => createRequestHandler(appContext))
}))
```

## Transient dependencies

### Before

In Iniettore pre-v4 there was this concept of **temporary dependencies** (or transient dependencies). See below a refresher.


```javascript
import iniettore from 'iniettore'
import { VALUE, PROVIDER } from 'iniettore'

function fooProvider(bar, baz) {
  return { bar, baz }
}

var rootContext = iniettore.create(function(map) {
  map('bar')
    .to(42)
    .as(VALUE)

  // NOTE: baz is not registered here
  map('foo')
    .to(fooProvider)
    .as(PROVIDER)
    .injecting('bar', 'baz')
})

var transientDependencies = {
  baz: 'pluto'
}
var foo = rootContext.using(transientDependencies).get('foo')

console.log(foo) // { bar: 42, baz: 'pluto' }
```

### After

In iniettore v4 everything is much simpler! Just use a function and do a partial application like in the [Functions](#functions) After example.

## Singletons

Iniettore pre-v4 had 3 types of singletons: Lazy, Eager, and Transient.

### Lazy singletons

In pre-v4 a Lazy Singleton mapping was designed to produce a singleton instance when requested the first time. The instance was destroyed only when the containing Iniettore context was destroyed.

**BREAKING CHANGE:** Iniettore v4 does NOT have a way to define a singletons with the lifecycle described above.

### Eager singletons

#### Before

In iniettore pre-v4 an Eager Singleton mapping was designed to produce a singleton instance at registration time. The instance was destroyed when the corresponding context was destroyed.

This implied that all the required dependencies must be registered in the context or in one of its ancestors.

The example below shows an Eager Singleton Constructor and an Eager Singleton Provider.

```javascript
import iniettore from 'iniettore'
import { EAGER, SINGLETON, PROVIDER, CONSTRUCTOR, VALUE } from 'iniettore'

var idx = 0

function fooProvider(answer) {
  console.log('foo provider invoked:', answer)
  return {
    id: ++idx
  }
}

class Bar {
  constructor(answer) {
    console.log('Bar instance created', answer)
  }
}

var rootContext = iniettore.create(function(map) {
  map('answer')
    .to(42)
    .as(VALUE)
  map('foo')
    .to(fooProvider)
    .as(EAGER, SINGLETON, PROVIDER)
    .injecting('answer')
  map('bar')
    .to(Bar)
    .as(EAGER, SINGLETON, CONSTRUCTOR)
    .injecting('answer')
})

// foo provider invoked: 42
// Bar instance created: 42
```

#### After

Because iniettore API are all syncronous there is no functional difference in instantiating a singleton binding during the registration or just after.

Below you can see an example using the same `fooProvider` and `Bar` class of the pre-v4 example.

```typescript
import { container, Context, singleton, provider } from 'iniettore'

const context = container(() => ({
  foo: singleton(fooProvider)
  bar: singleton(() => new Bar())
}))

const foo = get(context.foo)
const bar = get(context.bar)
```

### Transient singletons

#### Before

In pre-v4 a mapping marked as `TRANSIENT, SINGLETON` produced a **temporary lazy singleton** instance. The instance was created at the first time it is requested (directly or as dependency of another mapping) and was destroyed when it was no longer needed. See example below.

```javascript
import iniettore from 'iniettore'
import { TRANSIENT, SINGLETON, PROVIDER } from 'iniettore'

var idx = 0

function fooProvider() {
  return {
    id: ++idx
  }
}

var rootContext = iniettore.create(function(map) {
  map('foo')
    .to(fooProvider)
    .as(TRANSIENT, SINGLETON, PROVIDER)
})

var foo1 = rootContext.get('foo')
var foo2 = rootContext.get('foo')
console.log(foo1 === foo2) // true

// assuming that we don't need foo anymore
rootContext.release('foo')
rootContext.release('foo')

var foo3 = rootContext.get('foo')
console.log(foo1 === foo3) // false
```

#### After

Using pre-v4 terminology, all Iniettore v4 singletons are transient by default.

## Dispose singletons
### Before
In pre-v4 a mapping defined as `LAZY, SINGLETON` or `TRANSIENT, SINGLETON` was "disposable" if it implemented a method with the following signature:

`dispose(): void`

When Iniettore Context figured out that it was time to dispose the instance, such method was invoked. While this was an opportunity to cleanup any hanging reference (e.g. remove event listeners), the API was clunky and prescriptive.

```javascript
import iniettore from 'iniettore'
import { LAZY, SINGLETON, CONSTRUCTOR } from 'iniettore'
import { EventEmitter } from 'events'

class Foo {
  constructor(events) {
    this._events = events
    this._events.on('message', this._onMessage)
  }

  _onMessage(evt) {
    /* ... */
  }

  dispose() {
    this._events.off('message', this._onMessage)
  }
}

var rootContext = iniettore.create(function(map) {
  map('events')
    .to(EventEmitter)
    .as(EAGER, SINGLETON, CONSTRUCTOR)
  map('foo')
    .to(Foo)
    .as(LAZY, SINGLETON, CONSTRUCTOR)
    .injecting('events')
})
var events = rootContext.get('events')
console.log(events.listeners('message').length) // 0

var foo = rootContext.get('foo')

// let's check the number of event handlers
console.log(events.listeners('message').length) // 1

// foo.dispose will be invoked
rootContext.release('foo')

// the event handler has been unbound
console.log(events.listeners('message').length) // 0
```

### After

Iniettore v4 has a way more flexible approach 

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

## Dispose a whole Iniettore Context

### Before

In pre-v4 Iniettore contexts had a `dispose(): void` method that could be used to signal that a context was non longer needed and all its mappings could free any singleton instance they might have instantiated.

```javascript
var rootContext = iniettore.create(function(map) {
  // your bindings goes here
});

// use rootContext as you think best

rootContext.dispose(); // invokes <instance>.dispose() on all instanciated singletons that provides such method.

```

### After

In Iniettore v4 it possible to achieve the same using the `free` function. See example below.

```typescript
import { container, get, singleton } from 'iniettore'

const context = container(() => ({
  createdAt: singleton(() => new Date())
}))

let date = get(context.createdAt)

data = null // observe we didn't bother with to free(context.createdAt)
free(context)
```


