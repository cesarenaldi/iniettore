import extractImplicitDependencies from './extractImplicitDependencies'
import { EAGER, SINGLETON, PROVIDER, CONSTRUCTOR } from './options'

const EAGER_SINGLETON_PROVIDER = generateMask([EAGER, SINGLETON, PROVIDER])
const EAGER_SINGLETON_CONSTRUCTOR = generateMask([EAGER, SINGLETON, CONSTRUCTOR])

export function identity(value) {
  return value
}

export function invoke(fn, deps) {
  return fn.apply(null, deps)
}

export function partial(func, deps) {
  return function(...args) {
    return func.apply(this, deps.concat(args))
  }
}

export function instanciate(Ctor, deps) {
  return new Ctor(...deps)
}

export function generateMask(flags) {
  return flags.reduce((prev, curr) => prev | curr, 0)
}

export function isEagerSingleton(type) {
  return [EAGER_SINGLETON_PROVIDER, EAGER_SINGLETON_CONSTRUCTOR].indexOf(type) > -1
}

export function noop() {}

export { extractImplicitDependencies }
