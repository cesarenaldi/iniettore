
# ![Iniettore](https://github.com/cesarenaldi/iniettore/raw/master/logo.png) Iniettore

[![Build Status](https://travis-ci.org/cesarenaldi/iniettore.svg?branch=master)](https://travis-ci.org/cesarenaldi/iniettore)
[![GitHub version](https://badge.fury.io/gh/cesarenaldi%2Finiettore.svg)](http://badge.fury.io/gh/cesarenaldi%2Finiettore)
[![NPM dependencies](https://david-dm.org/cesarenaldi/iniettore.svg)](https://david-dm.org/cesarenaldi/iniettore)
[![Coverage Status](https://img.shields.io/coveralls/cesarenaldi/iniettore.svg)](https://coveralls.io/r/cesarenaldi/iniettore?branch=master)

## TODO
- [x] Dispose sub dependencies
- [x] Child context support
- [x] Bind container itself
- [x] Handle errors in case constructors, providers or dispose fails
	- [x] keep original errors trackable
- [ ] ~~Make possible to pass extra params~~
- [ ] Complete debug logs
- [ ] Handle errors in case of wrong api calls
- [ ] Make dispose method name configurable
- [ ] Improve fluid API
	- [ ] remove done call
	- [x] add experimental contribution phase into a revealing construction pattern
	- [ ] refactor APIs to be more explicit
- [ ] test case when singletons do NOT implement a dispose method (see test coverage)
- [x] cleanup
	- [x] remove memoize if not used
	- [x] remove merge if not used

- [ ] DOCS
	- [ ] Features
	- [ ] Specify ECMA Script 5 required features or polyfills
	- [ ] Quick usage
	- [ ] Detailed examples

### DEFER
- [ ] ~~Detect invalid singleton destroy calls.~~ Too complex for a minor benefit.
### WONT DO IT
- [ ] ~~Consider derring the release in case the object will be required in the short term~~ - complicated and no real benefits - the container consumer should do that before calling release

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

### Usage
```javascript
import iniettore from 'iniettore'
import { VALUE, SINGLETON, CONSTRUCTOR } from 'iniettore/lib/options'

class UltimateQuestion {
	constructor(answer) {
		console.log(answer) // 42
	}
}

var container = iniettore.create(function () {
	context
		.map('answer')
		.to(42)
		.as(VALUE)

		.map('question')
		.to(UltimateQuestion)
		.as(SINGLETON, CONSTRUCTOR)
		.injecting('answer')
})

var question = container.get('question')

console.log(question instanceof UltimateQuestion) // true
```

## Advanced usage

### Value objects and instances
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
