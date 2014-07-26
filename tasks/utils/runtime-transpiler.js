var jstransform = require('jstransform')
var fs = require('fs')
var visitorList = require('./visitors').visitorList
var loader = require.extensions['.js']

function stripBOM(content) {
	if (content.charCodeAt(0) === 0xFEFF) {
		content = content.slice(1)
	}
	return content
}

require.extensions['.js'] = function(module, filename) {

	var src

	if (! (/iniettore\/(?:src|test)/.test(filename)) ) {
		return loader.apply(this, [].slice.call(arguments))
	}

	src = fs.readFileSync(filename, {encoding: 'utf8'})

	try {
		src = jstransform.transform(visitorList, src, { minify: true })
	} catch (e) {
		throw new Error('Error transforming ' + filename + ' to ES6: ' + e.toString())
	}
	module._compile(stripBOM(src.code), filename)
}