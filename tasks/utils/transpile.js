'use strict'

var through = require('through2')
var jstransform = require('jstransform')
var visitorList = require('./visitors').visitorList

module.exports = function (options) {
	options = options || {}

	return through.obj(function (file, enc, cb) {
		var src

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'))
			return cb()
		}

		src = file.contents.toString('utf8')
		src = jstransform.transform(visitorList, src)

		file.contents = new Buffer(src.code)

		this.push(file)
		
		cb()
	})
}
