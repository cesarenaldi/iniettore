import { noop } from './utils'

export default function createSimpleMappingFactory(func) {
  return function(value, resolveDeps) {
    return {
      get() {
        return func.call(null, value, resolveDeps())
      },
      release: noop,
      dispose: noop
    }
  }
}
