/**
 * @flow
 */
import Context from './Context'
import Logger from './Logger'

export * from './options'

export { default as context } from './context.v2'
export * from './handlers'
export * from './bindings'

export default {
  create(conf: any, options: any) {
    var logger

    options = options || {}
    logger = new Logger(options)

    return new Context(conf, logger)
  }
}
