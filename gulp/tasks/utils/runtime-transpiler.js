var jstransform = require('jstransform')
var fs = require('fs')
var visitors = require('./visitors')
var loader = require.extensions['.js']

function stripBOM(content) {
	// Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	// because the buffer-to-string conversion in `fs.readFileSync()`
	// translates it to FEFF, the UTF-16 BOM.
	if (content.charCodeAt(0) === 0xFEFF) {
		content = content.slice(1)
	}
	return content
}

require.extensions['.js'] = function(module, filename) {

	var src

	if (! (/iniettore\/(?:lib|test)/.test(filename)) ) {
		return loader.apply(this, [].slice.call(arguments))
	}

	src = fs.readFileSync(filename, {encoding: 'utf8'})

	try {
		src = jstransform.transform(visitors, src, { minify: false })
	} catch (e) {
		throw new Error('Error transforming ' + filename + ' to ES6: ' + e.toString())
	}
	module._compile(stripBOM(src.code), filename)
}