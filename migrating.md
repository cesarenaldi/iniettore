Migrating to v4
---

## Deprecated
- eager singletons
- implicit dependency argument notation
- property mapper
- lazy singletons...all singletons managed by iniettore are transient
- eager singleton not managed by the library

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

In pre-v4 it was possible to define a mapping as a function and if dependencies where specified this would have resulted in a partial application of the provided function being registered into the context.

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

The simplified interface of iniettore v4 gives all the freedom one need to achieve the same without having to bloat the interface footprint.

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

Use the _singleton_ binding if you need only one instance to exist regardless of the consumers:

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
### Child contexts

Containers can be organized in a hierarchy. Given a context you can create a child context invoking `context.createChild(configure :Function) :Object` and providing the configuration function.

A child context can make use all the mappings of the parent context and ancestor contexts.

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

### Blueprints

Blueprint is effectively **a convenient way to register a child context factory**. The mapping value is the configuration function for the child context. Every time you request the blueprint mapping name you will get a new child context.

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

In case you are interested in only one mapping in the child context you can specify the exported alias. See example below.

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

### Transient dependencies

**EXPERIMENTAL FEATURE: don't abuse of it.**

While requesting an alias it's possible to provide **temporary dependencies** to satisfy dependencies of the requested mapping or one of its dependency.

**Note:** Transient dependencies cannot be used to satisfy dependencies in the ancestor contexts.

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

### Service locator

TBC

### Singletons

Constructors and Providers can also be marked as singletons. A function registered as `SINGLETON, PROVIDER` will be used as singleton instance factory. A constructor registered as `SINGLETON, CONSTRUCTOR` will be used to create only once instance of the constructor type.

Singletons can be marked as: `LAZY`, `EAGER` or `TRANSIENT`.

- [Lazy singletons](#persistent-singletons)
- [Eager singletons](#eager-singletons)
- [Transient singletons](#transient-singletons)

#### Lazy singletons

A mapping marked as `LAZY, SINGLETON` produce a singleton instance that gets created at the first time it is requested. It gets destroyed only when the context it has been registered into gets destroyed. See [`context.dispose`](#context-dispose).

##### Lazy Singleton Provider

```javascript
import iniettore from 'iniettore'
import { LAZY, SINGLETON, PROVIDER } from 'iniettore'

var idx = 0

function fooProvider() {
  return {
    id: ++idx
  }
}

var rootContext = iniettore.create(function(map) {
  map('foo')
    .to(fooProvider)
    .as(LAZY, SINGLETON, PROVIDER)
})

var foo1 = rootContext.get('foo')
var foo2 = rootContext.get('foo')

console.log(foo1) // { idx: 1 }
console.log(foo1 === foo2) // true
```

##### Lazy Singleton Constructor

```javascript
import iniettore from 'iniettore'
import { LAZY, SINGLETON, CONSTRUCTOR } from 'iniettore'

var idx = 0

class Bar {
  constructor() {
    this.idx = ++idx
  }
}

var rootContext = iniettore.create(function(map) {
  map('bar')
    .to(Bar)
    .as(LAZY, SINGLETON, CONSTRUCTOR)
})

var bar1 = rootContext.get('bar')
var bar2 = rootContext.get('bar')

console.log(bar1) // { idx: 1 }
console.log(bar1 === bar2) // true
```

#### Eager singletons

A mapping marked as `EAGER, SINGLETON` gets created at registration time.
All the required dependencies must be already registered in the current context or in one of its ancestors.

Eager singletons gets destroyed when the corresponding context is destroyed.

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

#### Transient singletons

A mapping marked as `TRANSIENT, SINGLETON` produce a **temporary lazy singleton** instance. The instance gets created at the first time it is requested (directly or as dependency of another mapping) and gets destroyed when is not used anymore.

A transient singleton allows to guarantee that at any given point in time there are no more than one instance of the respective mapping (whetever has been created using a constructor or a provider function).

In order to announce that a singleton is not used anymore you can invoke `context.release(name:string):void` method. The instance gets _released_ (i.e. all references to it gets removed) when `context.release` is invoked as many time as it has been requested. See examples below.

##### Transient Singleton Provider

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

##### Transient Singleton Constructor

```javascript
import iniettore from 'iniettore'
import { TRANSIENT, SINGLETON, CONSTRUCTOR } from 'iniettore'

var idx = 0

class Bar {
  constructor() {
    this.idx = ++idx
  }
}

var rootContext = iniettore.create(function(map) {
  map('bar')
    .to(Bar)
    .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
})

var bar1 = rootContext.get('bar')
var bar2 = rootContext.get('bar')
console.log(bar1 === bar2) // true

// assuming that we dont need bar anymore
rootContext.release('bar')
rootContext.release('bar')

var bar3 = rootContext.get('bar')
console.log(bar1 === bar3) // false
```

##### Transient singleton dependencies

```javascript
import iniettore from 'iniettore'
import { TRANSIENT, SINGLETON, CONSTRUCTOR, PROVIDER } from 'iniettore'

var idx = 0

class Bar {
  constructor() {
    this.idx = ++idx
  }
}

function fooProvider(bar) {
  return {
    bar,
    method: function() {}
  }
}

var rootContext = iniettore.create(function(map) {
  map('bar')
    .to(Bar)
    .as(TRANSIENT, SINGLETON, CONSTRUCTOR)
  map('foo')
    .to(fooProvider)
    .as(TRANSIENT, SINGLETON, PROVIDER)
    .injecting('bar')
})

var foo1 = rootContext.get('foo')
console.log(foo1) // { bar: { idx: 1 }, method: function () {} }
var foo2 = rootContext.get('foo')
console.log(foo1 === foo2) // true
console.log(foo1.bar === foo2.bar) // true

// assuming that we don't need foo anymore
// we have to release it as many times as it as been acquired
rootContext.release('foo')
// now also bar gets released
rootContext.release('foo')

// when requesting foo again we receive
// a new instance of it and a new instance of bar as well
var foo3 = rootContext.get('foo')
console.log(foo3) // { bar: { idx: 2 }, method: function () {} }
console.log(foo1 === foo3) // false
console.log(foo1.bar === foo3.bar) // false
```

### Lifecycle

iniettore offers a simple concept of lifecycle management for singleton instances and contexts. Let's see what it means for instances and contexts.

- [`instance.dispose`](#instancedispose)
- [`context.dispose`](#contextdispose)

#### `instance.dispose`

Given a `LAZY, SINGLETON` or `TRANSIENT, SINGLETON` instance that implements a method called `dispose():void` when the instance gets released the context will invoke it. This allow you to cleanup any hanging reference (e.g. remove event listeners) so the instance can be properly garbage collected.

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

#### `context.dispose`

```
var rootContext = iniettore.create(function(map) {
  // your bindings goes here
});

// use rootContext as you think best

rootContext.dispose(); // invokes <instance>.dispose() on all instanciated singletons that provides such method.

```
