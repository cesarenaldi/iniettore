
# ![Iniettore](https://github.com/cesarenaldi/iniettore/raw/api-refactoring/logo.png) Iniettore

[![Build Status](https://travis-ci.org/cesarenaldi/iniettore.svg?branch=api-refactoring)](https://travis-ci.org/cesarenaldi/iniettore)
[![GitHub version](https://badge.fury.io/gh/cesarenaldi%2Finiettore.svg)](http://badge.fury.io/gh/cesarenaldi%2Finiettore)
[![NPM dependencies](https://david-dm.org/cesarenaldi/iniettore.svg)](https://david-dm.org/cesarenaldi/iniettore)
[![Coverage Status](https://img.shields.io/coveralls/cesarenaldi/iniettore.svg)](https://coveralls.io/r/cesarenaldi/iniettore?branch=api-refactoring)

## TODO
- [ ] Make singletons dispose method name configurable
- [ ] Improve `instanciate` function to copy static methods/properties to the Surrogate constructor

## Features


## Specify ECMA Script 5 required features or polyfills
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
		.map('answer')
		.to(42)
		.as(VALUE)

		.map('drone')
		.to(drone)
		.as(INSTANCE)
})

var answer = container.get('answer')

console.log(container.get('drone') === drone) // true
```
### Functions
### Providers
### Constructor
### Child context
### Blueprint
### Transient dependencies 

## Notes on singletons
## Notes on lifecycle
### Instances `dispose`
### Context `dispose`


## Throubleshooting
