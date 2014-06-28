var gulp = require('gulp')
var debug = require('gulp-debug')
var karma = require('gulp-karma')
var browserify = require('browserify')
var watchify = require('watchify')
var glob = require('glob')
var watch = require('gulp-watch')
var jstransformify = require('jstransformify')
var source = require('vinyl-source-stream')
var streamify = require('gulp-streamify')
var foreach = require('gulp-foreach')
var visitors = require('./utils/visitors').visitors

gulp.task('test-browser', function() {
	return gulp.src('./test/spec/**/*.spec.js')
		.pipe(foreach(function (stream, file) {
			return browserify(file.path)
				.transform({
					visitors: visitors
				}, jstransformify)
				.bundle({ debug: true, minify: true })
				.pipe(source(file.path))
		}))
		.pipe(gulp.dest('./.tmp'))
		.pipe(karma({
			configFile: 'karma.conf.js'
		}))		
})