import { CONTEXT_ALIAS } from './constants'
import { VALUE } from './options'
import { generateMask, noop, isEagerSingleton } from './utils'
import createMapping from './createMapping'
import createFluentInterface from './createFluentInterface'

class Context {
  constructor(conf, logger, mappings, signalRelease) {
    var api

    if (typeof conf !== 'function') {
      throw new Error('Invalid container creation, missing contribution function')
    }

    this._mappings = mappings || {}
    this._logger = logger
    this._resolving = {}
    this._pending = []
    this._children = {}
    this._signalRelease = signalRelease || noop

    this._bind(CONTEXT_ALIAS, this, VALUE, [])
    api = createFluentInterface(this._bind.bind(this))
    conf(api.map.bind(api))
    api.done()
  }

  get(alias) {
    const [name, property] = alias.split('.')

    return this._logger.log(`resolving '${name}'`, () => {
      if (this._resolving[name]) {
        throw new Error(`Circular dependency detected while resolving '${name}'`)
      }
      if (!(name in this._mappings)) {
        throw new Error(`'${name}' is not available. Has it ever been registered?.`)
      }

      this._resolving[name] = true
      try {
        return this._mappings[name].get(property)
      } catch (err) {
        err.message = `Failed while resolving '${name}' due to:\n\t${err.message}`
        throw err
      } finally {
        this._resolving[name] = false
      }
    })
  }

  using(transientsDeps) {
    return {
      get: alias => {
        var dep

        for (dep in transientsDeps) {
          this._bind(dep, transientsDeps[dep], VALUE, [])
        }
        this.get(alias)
        for (dep in transientsDeps) {
          this._unbind(dep)
        }
      }
    }
  }

  release(alias) {
    const [name] = alias.split('.')

    if (name in this._mappings) {
      try {
        this._mappings[name].release()
      } catch (err) {
        err.message = `Failed while releasing '${name}' due to:\n\t${err.message}`
        throw err
      }
    }
  }

  createChild(conf) {
    var id = Object.keys(this._children).length + 1
    var child = new Context(conf, this._logger, Object.create(this._mappings), this._releaseChild.bind(this, id))

    this._children[id] = child
    return child
  }

  dispose() {
    this._disposeChildren()
    this._disposeInstances()
    this._signalRelease()
    this._signalRelease = noop
  }

  _disposeChildren() {
    var children = this._children
    var id

    for (id in children) {
      /* istanbul ignore else  */
      if (children.hasOwnProperty(id)) {
        children[id].dispose()
        this._releaseChild(id)
      }
    }
  }

  _releaseChild(id) {
    delete this._children[id]
  }

  _disposeInstances() {
    var mappings = this._mappings
    var alias

    for (alias in mappings) {
      /* istanbul ignore else  */
      if (mappings.hasOwnProperty(alias)) {
        try {
          mappings[alias].dispose()
        } catch (err) {
          err.message = `Failed while disposing '${alias}' due to:\n\t${err.message}`
          throw err
        }
        delete mappings[alias]
      }
    }
  }

  _bind(alias, value, type, deps) {
    this._mappings[alias] = createMapping(type, value, this._resolve.bind(this, deps), this._release.bind(this, deps))
    if (isEagerSingleton(type)) {
      this.get(alias)
    }
  }

  _unbind(alias) {
    this._mappings[alias].dispose()
    delete this._mappings[alias]
  }

  _release(deps) {
    return deps.forEach(dep => {
      this.release(dep)
    })
  }

  _resolve(deps) {
    return deps.map(dep => {
      return this.get(dep)
    })
  }
}

export default Context
