
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
- [ ] Make possible to pass extra params
	- [x] to contructors and providers
	- [ ] singletons should consider the arguments (comms layer considerations), maybe destroying the previous version ?
- [ ] Complete debug logs
- [ ] Handle errors in case of wrong api calls
- [ ] Make dispose method name configurable
- [ ] Improve fluid API
	- [ ] remove done call
- [ ] test case when singletons do NOT implement a dispose method
- [ ] cleanup
	- [ ] remove memoize if not used
	- [ ] remove merge if not used

- [ ] DOCS
	- [ ] Features
	- [ ] Specify ECMA Script 5 required features or polyfills
	- [ ] Quick usage
	- [ ] Detailed examples

DEFER
- [ ] Detect invalid singleton destroy calls
WONT DO IT
- [ ] Consider derring the release in case the object will be required in the short term - complicated and no rel benefits - the container consumer should do that before calling release
