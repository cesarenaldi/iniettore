class Logger {
  constructor(options) {
    this._options = options
    this._count = 0
    this._stack = {}
  }

  log(message, func) {
    var result

    if (process.env.NODE_ENV !== 'production' && this._options.debug) {
      this._start(message)
      result = func()
      this._stop(message)
      return result
    }
    return func()
  }

  _start(message) {
    var indentation = this._indent()
    var now = new Date()

    this._stack[message] = now

    console.log(`[${now.toISOString()}] ${indentation}Starting ${message}...`)
  }

  _stop(message) {
    var indentation = this._unindent()
    var now = new Date()
    var elapsed = now - this._stack[message]

    console.log(`[${now.toISOString()}] ${indentation}Finished ${message} after ${elapsed} ms`)
  }

  _indent() {
    return Array(++this._count).join('  ')
  }

  _unindent() {
    return Array(this._count--).join('  ')
  }
}

export default Logger
