var through = require('through2')
var jstransform = require('jstransform')
var visitors = require('./visitors')

module.exports = function (filename) {
	return through(function (buf, enc, next) {
		var src = buf.toString('utf8')

		src = jstransform.transform(visitors, src, { 
			minify: false,
			sourceMap: true,
          	filename: filename
		})
		this.push(src.code)
		next()
	})
}