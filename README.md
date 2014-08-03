# ![Iniettore](https://github.com/cesarenaldi/iniettore/raw/master/logo.png) Iniettore

[![Build Status](https://travis-ci.org/cesarenaldi/iniettore.svg?branch=master)](https://travis-ci.org/cesarenaldi/iniettore)
[![GitHub version](https://badge.fury.io/gh/cesarenaldi%2Finiettore.svg)](http://badge.fury.io/gh/cesarenaldi%2Finiettore)
[![NPM dependencies](https://david-dm.org/cesarenaldi/iniettore.svg)](https://david-dm.org/cesarenaldi/iniettore)
[![Coverage Status](https://img.shields.io/coveralls/cesarenaldi/iniettore.svg)](https://coveralls.io/r/cesarenaldi/iniettore?branch=master)

## TODO
- [ ] Make singletons dispose method name configurable
- [ ] Improve `instanciate` function to copy static methods/properties to the Surrogate constructor
- [ ] ~~Add $child special injector and remove $context.~~ No real benefit.
- [ ] Add instance property injection (i.e. use of pattern such `foo.prop` as injecting alias)
- [ ] Analyze release path when `FUNCTION` or no-singleton `PROVIDER` and `CONTRUCTOR` are involved. Potential bug.
- [ ] Adds mention of creational mapping into provider, constructor and blueprint docs
- [ ] Adds API quick reference
- [ ] Block contribution on container after container creation
- [ ] Expose flags from main module
- [x] Evaluate to change PERSISTENT flag with LAZY

## Table of Content
- [Features](#features)
- [ECMA Script 5 required features or polyfills](#ecma-script-5-required-features)
- [Quick start](#quick-start)
- [Terminology](#terminology)
- [Advanced usage](#advanced-usage)
- [Throubleshooting](#throubleshooting)

## Features
- [Extreme late binding](#extreme-late-binding)
- [Functional Programming support](#functional-rogramming-support)
- [Lifecycle management](#lifecycle-management)

### Extreme late binding
With exception of [eager singletons](#eager-singletons), all instances and dependencies are resolved only when requested rather when registered into the container.

### Functional Programming support
`FUNCTION`, `PROVIDER` and `INSTANCE` mappings are the ideal solution to have DI in Functional Programming.

### Lifecycle management
TBC

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
import { VALUE, LAZY, SINGLETON, CONSTRUCTOR } from 'iniettore/lib/options'

class UltimateQuestion {
	constructor(answer) {
		console.log(answer)
	}
}

var container = iniettore.create(function (context) {
	context
		.map('answer')
		.to(42)
		.as(VALUE)

		.map('question')
		.to(UltimateQuestion)
		.as(LAZY, SINGLETON, CONSTRUCTOR)
		.injecting('answer')
})

var question = container.get('question') // 42

console.log(question instanceof UltimateQuestion) // true
```
## Terminology
- **Container** - TBC
- **Context** - TBC
- **Mapping** - TBC
- **Creational mapping** - TBC

## Advanced usage

- [Values and instances](#values-and-instances)
- [Functions](#functions)
- [Providers](#providers)
- [Constructors](#constructors)
- [Child containers](#child-containers)
- [Blueprints](#blueprints)
- [Transient dependencies](#transient-dependencies)
- [Service locator](#service-locator)
- [Singletons](#singletons)
- [Lifecycle](#lifecycle)

### Values and instances
```javascript
import iniettore from 'iniettore'
import { VALUE, INSTANCE } from 'iniettore/lib/options'

var drone = {
	fly: function () { /*...*/ }
}

var container = iniettore.create(function (context) {
	context
		.map('answer').to(42).as(VALUE)
		.map('drone').to(drone).as(INSTANCE)
})

var answer = container.get('answer')

console.log(container.get('drone') === drone) // true
```
### Functions
You can register a function into the container and specify the its dependencies. When requesting the function you will get a partial application of it with all dependencies already satisfied.
```javascript
import iniettore from 'iniettore'
import { VALUE, FUNCTION } from 'iniettore/lib/options'

function fooFunction(bar, baz) {
	console.log(bar, baz)
}

var container = iniettore.create(function (context) {
	context
		.map('bar').to('BAR').as(VALUE)
		.map('foo').to(fooFunction).as(FUNCTION).injecting('bar')
})

var foo = container.get('foo') // foo is a partial application of the original function

foo(42) // BAR, 42
```
### Providers
Providers are generic functions that returns object or values specific for your application domain. A factory function can be seen as a special use case of the provider pattern.

Every request will invoke the provider function and return a new value. The returned value depends on the nature of the registered provider function.
```javascript
import iniettore from 'iniettore'
import { PROVIDER } from 'iniettore/lib/options'

var idx = 0

function fooProvider(bar) {
	idx++

	return { idx, bar }
}

var container = iniettore.create(function (context) {
	context
		.map('bar').to(42).as(VALUE)
		.map('foo').to(fooProvider).as(PROVIDER).injecting('bar')
})

console.log(container.get('foo')) // { idx: 1, bar: 42 }
console.log(container.get('foo')) // { idx: 2, bar: 42 }
```
### Constructors
You can register constructors specifying the constructor dependencies. Every request will receive a new instance of the specified constructor.

**Note:** no setters injection is supported at the moment.
```javascript
import iniettore from 'iniettore'
import { CONSTRUCTOR } from 'iniettore/lib/options'

var idx = 0

class Bar {
	constructor() {
		this.idx = ++idx
	}
}

var container = iniettore.create(function (context) {
	context
		.map('bar').to(Bar).as(CONSTRUCTOR)
})

console.log(container.get('bar')) // { idx: 1 }
console.log(container.get('bar')) // { idx: 2 }
```
### Child containers
Containers can be organized in a hierarchy. Given a container you can create a child container invoking `container.createChild(configure :Function) :Object` and providing the configuration function.

A child container can make use all the mappings of the parent container and ancestor containers.

```javascript
import iniettore from 'iniettore'
import { VALUE, PROVIDER } from 'iniettore/lib/options'

function fooProvider(bar, baz) {
	return { bar, baz }
}

var parent = iniettore.create(function (context) {
	context
		.map('bar').to(42).as(VALUE)
		.map('baz').to('pluto').as(VALUE)
})
var child = parent.createChild(function (context) {
	context
		.map('bar').to(84).as(VALUE) // this will shadow the parent mapping
		.map('foo').to(fooProvider).as(PROVIDER).injecting('bar', 'baz')
})

console.log(parent.get('bar')) // 42
console.log(child.get('bar')) // 84
console.log(child.get('foo')) // { bar: 84, baz: 'pluto' }
```
### Blueprints
Blueprint is effectively **a convenient way to register a child container factory**. The mapping value is the configuration function for the child container. Every time you request the blueprint alias you will get a new child container.
```javascript
import iniettore from 'iniettore'
import { VALUE, BLUEPRINT } from 'iniettore/lib/options'

function configureChildContext(context) {
	context
		.map('baz').to('pluto').as(VALUE)
}

var container = iniettore.create(function (context) {
	context
		.map('bar').to(42).as(VALUE)
		.map('foo').to(configureChildContext).as(BLUEPRINT)
})

var child = container.get('foo')

console.log(child.get('bar')) // 42
console.log(child.get('baz')) // pluto
```
In case you are interested in only one mapping in the child container you can specify the exported alias. See example below.
```javascript
import iniettore from 'iniettore'
import { VALUE, FUNCTION, BLUEPRINT } from 'iniettore/lib/options'

function baz(bar) {
	console.log(bar)
}

function configureChildContext(context) {
	context
		.map('baz').to(baz).as(FUNCTION).injecting('bar')
}

var container = iniettore.create(function (context) {
	context
		.map('bar').to(42).as(VALUE)
		.map('foo').to(configureChildContext).as(BLUEPRINT).exports('baz')
})

var baz = container.get('foo')

console.log(baz()) // 42
```
### Transient dependencies
**EXPERIMENTAL FEATURE: don't abuse of it.**

While requesting an alias it's possible to provide **temporary dependencies** to satisfy dependencies of the requested mapping or one of his dependency.

**Note:** Transient dependencies cannot be used to satisfy dependencies in the ancestor containers.

```javascript
import iniettore from 'iniettore'
import { VALUE, PROVIDER } from 'iniettore/lib/options'

function fooProvider(bar, baz) {
	return { bar, baz }
}

var container = iniettore.create(function (context) {
	context
		.map('bar').to(42).as(VALUE)

		// NOTE: baz is not registered here
		.map('foo').to(fooProvider).as(PROVIDER).injecting('bar', 'baz') 
})

var transientDependencies = {
	baz: 'pluto'
}
var foo = container.using(transientDependencies).get('foo')

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
A mapping marked as `LAZY, SINGLETON` produce a singleton instance that gets created at the first time it is requested. It gets destroyed only when the container itself is destroyed. See [`container.dispose`](#container-dispose).

##### Lazy Singleton Provider
```javascript
import iniettore from 'iniettore'
import { LAZY, SINGLETON, PROVIDER } from 'iniettore/lib/options'

var idx = 0

function fooProvider() {
	return {
		id: ++idx
	}
}

var container = iniettore.create(function (context) {
	context
		.map('foo').to(fooProvider).as(LAZY, SINGLETON, PROVIDER)
})

var foo1 = container.get('foo')
var foo2 = container.get('foo')

console.log(foo1) // { idx: 1 }
console.log(foo1 === foo2) // true
```

##### Lazy Singleton Constructor
```javascript
import iniettore from 'iniettore'
import { LAZY, SINGLETON, CONSTRUCTOR } from 'iniettore/lib/options'

var idx = 0

class Bar {
	constructor() {
		this.idx = ++idx
	}
}

var container = iniettore.create(function (context) {
	context
		.map('bar').to(Bar).as(LAZY, SINGLETON, CONSTRUCTOR)
})

var bar1 = container.get('bar')
var bar2 = container.get('bar')

console.log(bar1) // { idx: 1 }
console.log(bar1 === bar2) // true
```

#### Eager singletons
A mapping marked as `EAGER, SINGLETON` gets at registration time.
All the required dependencies must be already registered in the current container or in one of its ancestors.

TBC

#### Transient singletons
A mapping marked as `TRANSIENT, SINGLETON` produce a **temporary lazy singleton** instance. The instance gets created at the first time it is requested (directly or as dependency of another mapping) and gets destroyed when is not used anymore.

A transient singleton allows to gurantee that at any given point in time there are no more than one instance of the respective mapping (whetever has been creates using a constructor or a provider function).

In order to announce that a singleton is not used anymore you can invoke `container.release(name :string) :void` method. The instance gets _released_ (i.e. all references to it gets removed) when `container.release` is invoked as many time as it has been requested. See examples below.

##### Transient Singleton Provider
```javascript
import iniettore from 'iniettore'
import { TRANSIENT, SINGLETON, PROVIDER } from 'iniettore/lib/options'

var idx = 0

function fooProvider() {
	return {
		id: ++idx
	}
}

var container = iniettore.create(function (context) {
	context
		.map('foo').to(fooProvider).as(TRANSIENT, SINGLETON, PROVIDER)
})

var foo1 = container.get('foo')
var foo2 = container.get('foo')
console.log(foo1 === foo2) // true

// assuming that we dont need foo anymore
container.relase('foo')

var foo3 = container.get('foo')
console.log(foo1 === foo3) // false
```

##### Transient Singleton Constructor
```javascript
import iniettore from 'iniettore'
import { TRANSIENT, SINGLETON, CONSTRUCTOR } from 'iniettore/lib/options'

var idx = 0

class Bar {
	constructor() {
		this.idx = ++idx
	}
}

var container = iniettore.create(function (context) {
	context
		.map('bar').to(Bar).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
})

var bar1 = container.get('bar')
var bar2 = container.get('bar')
console.log(bar1 === bar2) // true

// assuming that we dont need bar anymore
container.relase('bar')

var bar3 = container.get('bar')
console.log(bar1 === bar3) // false
```
##### Transient singleton dependencies
```javascript
import iniettore from 'iniettore'
import { TRANSIENT, SINGLETON, CONSTRUCTOR, PROVIDER } from 'iniettore/lib/options'

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

var container = iniettore.create(function (context) {
	context
		.map('bar').to(Bar).as(TRANSIENT, SINGLETON, CONSTRUCTOR)
		.map('foo').to(fooProvider).as(TRANSIENT, SINGLETON, PROVIDER).injecting('bar')
})

var foo1 = container.get('foo')
console.log(foo1) // { bar: { idx: 1 }, method: function () {} }
var foo2 = container.get('foo')
console.log(foo1 === foo2) // true
console.log(foo1.bar === foo2.bar) // true

// assuming that we don't need foo anymore
// we have to release it as many times as it as been acquired
container.relase('foo')
// also bar gets released
container.relase('foo') 

// when requesting foo again we receive
// a new instance of it and a new instance of bar as well
var foo3 = container.get('foo')
console.log(foo3) // { bar: { idx: 2 }, method: function () {} }
console.log(foo1 === foo3) // false
console.log(foo1.bar === foo3.bar) // false
```
### Lifecycle
iniettore offers a simple concept of lifecycle management for singleton instances and containers. Let's see what it means for instances and containers.

- [`instance.dispose`](#instancedispose)
- [`container.dispose`](#containerdispose)

#### `instance.dispose`

Given a `LAZY, SINGLETON` or `TRANSIENT, SINGLETON` instance that implements a method called `dispose() :void` when the instance gets released the container will invoke it. This allow you to cleanup any hanging reference (e.g. remove event listeners) so the instance can properly garbage collected.
```javascript
import iniettore from 'iniettore'
import { LAZY, SINGLETON, CONSTRUCTOR } from 'iniettore/lib/options'
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

var container = iniettore.create(function (context) {
	context
		.map('events').to(EventEmitter).as(EAGER, SINGLETON, CONSTRUCTOR)
		.map('foo').to(Foo).as(LAZY, SINGLETON, CONSTRUCTOR).injecting('events')
})
var events = container.get('events')
console.log(events.listeners('message').length) // 0

var foo = container.get('foo')

// let's check the number of event handlers
console.log(events.listeners('message').length) // 1

// foo.dispose will be invoked
container.release('foo')

// the event handler has been unbound
console.log(events.listeners('message').length) // 0
```

#### `container.dispose`
## Troubleshooting
