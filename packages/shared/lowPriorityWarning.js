const printWarning = function(format, ...args) {
  let argIndex = 0
  const message = 'Warning: ' + format.replace(/%s/g, () => args[argIndex++])
  if (typeof console !== 'undefined') {
    console.warn(message)
  }
}

export default function(condition, format, ...args) {
  if (format === undefined) {
    throw new Error('`lowPriorityWarning(condition, format, ...args)` requires a warning ' + 'message argument')
  }
  if (!condition) {
    printWarning(format, ...args)
  }
}
