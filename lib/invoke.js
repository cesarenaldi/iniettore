'use strict'

export default function invoke(fn, args) {
	return fn.apply(null, args)
}