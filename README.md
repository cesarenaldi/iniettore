# ![Iniettore](https://github.com/cesarenaldi/iniettore/raw/master/logo.png) Iniettore

[![Build Status](https://travis-ci.org/cesarenaldi/iniettore.svg?branch=master)](https://travis-ci.org/cesarenaldi/iniettore)
[![GitHub version](https://badge.fury.io/gh/cesarenaldi%2Finiettore.svg)](http://badge.fury.io/gh/cesarenaldi%2Finiettore)
[![NPM dependencies](https://david-dm.org/cesarenaldi/iniettore.svg)](https://david-dm.org/cesarenaldi/iniettore)
[![Coverage Status](https://img.shields.io/coveralls/cesarenaldi/iniettore.svg)](https://coveralls.io/r/cesarenaldi/iniettore?branch=master)

## WARNING: APIs are going to significantly change in v2.0
See documentation in tagged versions for previous usage.

## TODO
- [ ] Make singletons dispose method name configurable
- [x] ~~Improve `instanciate` function to copy static methods/properties to the Surrogate constructor.~~ Not necessary instance.constructor still points to original constructor.
- [ ] ~~Add $child special injector and remove $context.~~ No real benefit.
- [ ] Add instance property injection (i.e. use of pattern such `foo.prop` as injecting alias)
- [ ] Analyze release path when `FUNCTION` or no-singleton `PROVIDER` and `CONTRUCTOR` are involved. Potential bug.
- [ ] Adds mention of creational mapping into provider, constructor and blueprint docs
- [ ] Adds API quick reference
- [ ] Block contribution on context after context creation
- [x] Expose flags from main module
- [x] Evaluate to change PERSISTENT flag with LAZY

## Table of Content
- [Features](#features)
- [ECMA Script 5 required features or polyfills](#ecma-script-5-required-features)
- [Quick start](#quick-start)
- [Concepts](#concepts)
- [Advanced usage](#advanced-usage)
- [Throubleshooting](#throubleshooting)

## Features
- [Extreme late binding](#extreme-late-binding)
- [Functional Programming support](#functional-rogramming-support)
- [Lifecycle management](#lifecycle-management)
- [Predictable](#predictable)

### Extreme late binding
With exception of [eager singletons](#eager-singletons), all instances and dependencies are resolved only when requested rather when registered into the context.

### Functional Programming support
`FUNCTION`, `PROVIDER` and `INSTANCE` mappings are the ideal solution to have DI in Functional Programming.

### Lifecycle management
iniettore provides contexts and singleton lifecycle management.

### Predictable
iniettore handles all operation in a syncronous way so at any point in time you know what is instanciated and what is not.

## ECMA Script 5 required features
iniettore assumes that the following ES5 features are available. If you want to use the library in a no-ES5 compatible environment please provide a polyfill. For example see [es5-shim](https://github.com/es-shims/es5-shim).
- `Object.create`
- `Function.prototype.bind`

## Quick start

- [Installation](#installation)
- [Simple usage](#simple-usage)

### Installation

```bash
npm install iniettore --save
```

### Simple usage
```javascript
import iniettore from 'iniettore'
import { VALUE, LAZY, SINGLETON, CONSTRUCTOR } from 'iniettore'

class UltimateQuestion {
	constructor(answer) {
		console.log(answer)
	}
}

var rootContext = iniettore.create(function (map) {
	map('answer').to(42).as(VALUE)
	map('question').to(UltimateQuestion).as(LAZY, SINGLETON, CONSTRUCTOR).injecting('answer')
})

var question = rootContext.get('question') // 42

console.log(question instanceof UltimateQuestion) // true
```
## Concepts

### Context
A _context_ is a JS Object that contains the collection of mappings. During the creation of the context it is possible to register several mappings using the registration API provided inside the configuration function. After the context has been fully created it's only possible to request mapping from it using the query API.
```javascript
import iniettore from 'iniettore'
import { VALUE } from 'iniettore'

var rootContext = iniettore.create(function (map) {
	// context can only be used to register new mappings
	map('answer').to(42).as(VALUE)
})

// rootContext is the interface for requesting mappings
var answer = rootContext.get('answer')

console.log(answer) // 42
```

### Child context
Contexts can be organized in a hierarchy. Given one context query interface it's possible to create a child context and provide a separate configuration function for registering child specific mappings. The child context can access all the mappings of his parent and ancestor in the same fashion as JS execution context can access parent ones.
A parente cannot see/use any of the mapping registered in its child contexts. A mapping registered in a child context that has the same name of a mapping in the parent context (or any of its ancestor contexts) will shadow the corresponding value in the same way that in JS a variable in a nested scope can shadows a variable defined in a "parent" scope. See [Child contexts](#child-contexts) for more details.

Continuing with the previouse example:
```javascript
import iniettore from 'iniettore'
import { VALUE, PROVIDER } from 'iniettore'

function questionProvider(answer) {
	return {
		question: 'What is the Answer to the Ultimate Question of Life, the Universe, and Everything?',
		answer
	}
}

var rootContext = iniettore.create(function (map) {
	map('answer').to(42).as(VALUE)
})

var childContext = rootContext.createChild(function (map) {
	map('question').to(questionProvider).as(PROVIDER).injecting('answer')
})

var question = childContext.get('question')

console.log(question) 
/*
 { 
 	question: 'What is the Answer to the Ultimate Question of Life, the Universe, and Everything?',
 	answer: 42
 }
 */
```

## Advanced usage

- [Values and instances](#values-and-instances)
- [Functions](#functions)
- [Providers](#providers)
- [Constructors](#constructors)
- [Child contexts](#child-contexts)
- [Blueprints](#blueprints)
- [Transient dependencies](#transient-dependencies)
- [Service locator](#service-locator)
- [Singletons](#singletons)
- [Lifecycle](#lifecycle)

### Values and instances
```javascript
import iniettore from 'iniettore'
import { VALUE, INSTANCE } from 'iniettore'

var drone = {
	fly: function () { /*...*/ }
}

var rootContext = iniettore.create(function (map) {
	map('answer').to(42).as(VALUE)
	map('drone').to(drone).as(INSTANCE)
})

var answer = rootContext.get('answer')

console.log(rootContext.get('drone') === drone) // true
```
### Functions
You can register a function into the context and specify the its dependencies. When requesting the function you will get a partial application of it with all dependencies already satisfied.
```javascript
import iniettore from 'iniettore'
import { VALUE, FUNCTION } from 'iniettore'

function fooFunction(bar, baz) {
	console.log(bar, baz)
}

var rootContext = iniettore.create(function (map) {
	map('bar').to('BAR').as(VALUE)
	map('foo').to(fooFunction).as(FUNCTION).injecting('bar')
})

var foo = rootContext.get('foo') // foo is a partial application of the original function

foo(42) // BAR, 42
```
### Providers
Providers are generic functions that returns object or values specific for your application domain. A factory function can be seen as a special use case of the provider pattern.

Every request will invoke the provider function and return a new value. The returned value depends on the nature of the registered provider function.
```javascript
import iniettore from 'iniettore'
import { PROVIDER } from 'iniettore'

var idx = 0

function fooProvider(bar) {
	idx++

	return { idx, bar }
}

var rootContext = iniettore.create(function (map) {
	map('bar').to(42).as(VALUE)
	map('foo').to(fooProvider).as(PROVIDER).injecting('bar')
})

console.log(rootContext.get('foo')) // { idx: 1, bar: 42 }
console.log(rootContext.get('foo')) // { idx: 2, bar: 42 }
```
### Constructors
You can register constructors specifying the constructor dependencies. Every request will receive a new instance of the specified constructor.

**Note:** no setters injection is supported at the moment.
```javascript
import iniettore from 'iniettore'
import { CONSTRUCTOR } from 'iniettore'

var idx = 0

class Bar {
	constructor() {
		this.idx = ++idx
	}
}

var rootContext = iniettore.create(function (map) {
	map('bar').to(Bar).as(CONSTRUCTOR)
})

console.log(rootContext.get('bar')) // { idx: 1 }
console.log(rootContext.get('bar')) // { idx: 2 }
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

var rootContext = iniettore.create(function (map) {
	map('bar').to(42).as(VALUE)
	map('baz').to('pluto').as(VALUE)
})
var childContext = rootContext.createChild(function (map) {
	map('bar').to(84).as(VALUE) // this will shadow the rootContext mapping
	map('foo').to(fooProvider).as(PROVIDER).injecting('bar', 'baz')
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
	map('baz').to('pluto').as(VALUE)
}

var rootContext = iniettore.create(function (map) {
	map('bar').to(42).as(VALUE)
	map('foo').to(configureChildContext).as(BLUEPRINT)
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
	map('baz').to(baz).as(FUNCTION).injecting('bar')
}

var rootContext = iniettore.create(function (map) {
	map('bar').to(42).as(VALUE)
	map('foo').to(configureChildContext).as(BLUEPRINT).exports('baz')
})

var baz = rootContext.get('foo')

console.log(baz()) // 42
```
### Transient dependencies
**EXPERIMENTAL FEATURE: don't abuse of it.**

While requesting an alias it's possible to provide **temporary dependencies** to satisfy dependencies of the requested mapping or one of his dependency.

**Note:** Transient dependencies cannot be used to satisfy dependencies in the ancestor contexts.

```javascript
import iniettore from 'iniettore'
import { VALUE, PROVIDER } from 'iniettore'

function fooProvider(bar, baz) {
	return { bar, baz }
}

var rootContext = iniettore.create(function (map) {
	map('bar').to(42).as(VALUE)

	// NOTE: baz is not registered here
	map('foo').to(fooProvider).as(PROVIDER).injecting('bar', 'baz') 
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
A mapping marked as `LAZY, SINGLETON` produce a singleton instance that gets created at the first time it is requested. It gets destroyed only when the context itself is destroyed. See [`context.dispose`](#context-dispose).

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

var rootContext = iniettore.create(function (map) {
	map('foo').to(fooProvider).as(LAZY, SINGLETON, PROVIDER)
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

var rootContext = iniettore.create(function (map) {
	map('bar').to(Bar).as(LAZY, SINGLETON, CONSTRUCTOR)
})

var bar1 = rootContext.get('bar')
var bar2 = rootContext.get('bar')

console.log(bar1) // { idx: 1 }
console.log(bar1 === bar2) // true
```

#### Eager singletons
A mapping marked as `EAGER, SINGLETON` gets created at registration time.
All the required dependencies must be already registered in the current context or in one of its ancestors.

Eager singletons gets destroyed when the corresponding context is destoroyed.

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

var rootContext = iniettore.create(function (map) {
	map('answer').to(42).as(VALUE)
	map('foo').to(fooProvider).as(EAGER, SINGLETON, PROVIDER).injecting('answer')
	map('bar').to(Bar).as(EAGER, SINGLETON, CONSTRUCTOR).injecting('answer')
})

// foo provider invoked: 42
// Bar instance created: 42
```

#### Transient singletons
A mapping marked as `TRANSIENT, SINGLETON` produce a **temporary lazy singleton** instance. The instance gets created at the first time it is requested (directly or as dependency of another mapping) and gets destroyed when is not used anymore.

A transient singleton allows to gurantee that at any given point in time there are no more than one instance of the respective mapping (whetever has been created using a constructor or a provider function).

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

var rootContext = iniettore.create(function (map) {
	map('foo').to(fooProvider).as(TRANSIENT, SINGLETON, PROVIDER)
})

var foo1 = rootContext.get('foo')
var foo2 = rootContext.get('foo')
console.log(foo1 === foo2) // true

// assuming that we dont need foo anymore
rootContext.relase('foo')

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

var rootContext = iniettore.create(function (map) {
	map('bar').to(Bar).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
})

var bar1 = rootContext.get('bar')
var bar2 = rootContext.get('bar')
console.log(bar1 === bar2) // true

// assuming that we dont need bar anymore
rootContext.relase('bar')

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
		method: function () {}
	}
}

var rootContext = iniettore.create(function (map) {
	map('bar').to(Bar).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
	map('foo').to(fooProvider).as(TRANSIENT, SINGLETON, PROVIDER).injecting('bar')
})

var foo1 = rootContext.get('foo')
console.log(foo1) // { bar: { idx: 1 }, method: function () {} }
var foo2 = rootContext.get('foo')
console.log(foo1 === foo2) // true
console.log(foo1.bar === foo2.bar) // true

// assuming that we don't need foo anymore
// we have to release it as many times as it as been acquired
rootContext.relase('foo')
// also bar gets released
rootContext.relase('foo') 

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

	_onMessage(evt) { /* ... */ }

	dispose() {
		this._events.off('message', this._onMessage)
	}
}

var rootContext = iniettore.create(function (map) {
	map('events').to(EventEmitter).as(EAGER, SINGLETON, CONSTRUCTOR)
	map('foo').to(Foo).as(LAZY, SINGLETON, CONSTRUCTOR).injecting('events')
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

TBC

## Troubleshooting

TBC
