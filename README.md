# ![Iniettore](https://github.com/cesarenaldi/iniettore/raw/master/logo.png) Iniettore &middot;  [![Build Status](https://travis-ci.org/cesarenaldi/iniettore.svg?branch=master)](https://travis-ci.org/cesarenaldi/iniettore) [![GitHub version](https://badge.fury.io/gh/cesarenaldi%2Finiettore.svg)](http://badge.fury.io/gh/cesarenaldi%2Finiettore) [![NPM dependencies](https://david-dm.org/cesarenaldi/iniettore.svg)](https://david-dm.org/cesarenaldi/iniettore) [![Coverage Status](https://coveralls.io/repos/cesarenaldi/iniettore/badge.svg?branch=master&service=github)](https://coveralls.io/github/cesarenaldi/iniettore?branch=master)

Iniettore is a JavaScript library to help developer assemble their applications.

- **Extreme late binding:** With exception of [eager singletons](#eager-singletons), all instances and dependencies are resolved only when requested rather when registered into the context.
- **Functional Programming support:**  `FUNCTION`, `PROVIDER` and `INSTANCE` mappings are the ideal solution to have DI in Functional Programming.
- **Lifecycle management:** Iniettore provides contexts and singletons lifecycle management.
- **Predictable:** Iniettore handles all operation in a synchronous way so at any point in time you know what is instantiated and what is not.

## Documentation

### Pre-requisites

Iniettore assumes that the following ES5 features are available. If you want to use the library in a no-ES5 compatible environment please provide a polyfill. For example see [es5-shim](https://github.com/es-shims/es5-shim).

- `Object.create`
- `Function.prototype.bind`

### Packages

Please refer to individial packages documentation.

- [iniettore](packages/iniettore) - the Iniettore core library.
- iniettore-react - the Iniettore React bindings. _Coming soon..._

## License

[ISC](LICENSE)
