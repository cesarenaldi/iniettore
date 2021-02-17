import { get, free } from 'iniettore'

/**
 * scope(context)(get => {
 *    const foo = get(context.foo);
 *
 *    // use foo
 * })
 */

export default context => scope => {
  return Promise.resolve(scope())
}