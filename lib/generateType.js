'use strict'

export default function generateType (flags) {
	return flags.reduce((prev, curr) => prev | curr, 0)
}