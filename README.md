
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
- [ ] test case when singletons do NOT implement a dispose method
- [x] cleanup
	- [x] remove memoize if not used
	- [x] remove merge if not used

- [ ] DOCS
	- [ ] Features
	- [ ] Specify ECMA Script 5 required features or polyfills
	- [ ] Quick usage
	- [ ] Detailed examples

DEFER
- [ ] ~~Detect invalid singleton destroy calls.~~ Too complex for a minor benefit.
WONT DO IT
- [ ] ~~Consider derring the release in case the object will be required in the short term~~ - complicated and no real benefits - the container consumer should do that before calling release
