# ![Iniettore](https://github.com/cesarenaldi/iniettore/raw/master/logo.png) Iniettore

[![Build Status](https://travis-ci.org/cesarenaldi/iniettore.svg?branch=master)](https://travis-ci.org/cesarenaldi/iniettore)
[![GitHub version](https://badge.fury.io/gh/cesarenaldi%2Finiettore.svg)](http://badge.fury.io/gh/cesarenaldi%2Finiettore)
[![NPM dependencies](https://david-dm.org/cesarenaldi/iniettore.svg)](https://david-dm.org/cesarenaldi/iniettore)
[![Coverage Status](https://img.shields.io/coveralls/cesarenaldi/iniettore.svg)](https://coveralls.io/r/cesarenaldi/iniettore?branch=master)

## TODO
- [ ] Make singletons dispose method name configurable
- [ ] Improve `instanciate` function to copy static methods/properties to the Surrogate constructor

## ECMA Script 5 required features or polyfills
- `Object.create`
- `Function.prototype.bind`

## Quick start

### Installation

node.js:

```bash
npm install iniettore --save
```

### Simple usage
```javascript
import iniettore from 'iniettore'
import { VALUE, SINGLETON, CONSTRUCTOR } from 'iniettore/lib/options'

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
		.as(SINGLETON, CONSTRUCTOR)
		.injecting('answer')
})

var question = container.get('question') // 42

console.log(question instanceof UltimateQuestion) // true
```

## Advanced usage

### Value objects and instances
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
```javascript
import iniettore from 'iniettore'
import { PROVIDER } from 'iniettore/lib/options'

var idx = 0

function fooProvider(bar, baz) {
	idx++

	return { idx }
}

var container = iniettore.create(function (context) {
	context
		.map('foo').to(fooProvider).as(PROVIDER)
})

console.log(container.get('foo')) // { idx: 1 }
console.log(container.get('foo')) // { idx: 2 }
```
### Constructor
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
### Child container
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
### Blueprint
### Transient dependencies 

## Notes on singletons
## Notes on lifecycle
### Instances `dispose`
### Context `dispose`


## Throubleshooting
