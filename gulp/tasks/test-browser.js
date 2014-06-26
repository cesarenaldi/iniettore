var gulp = require('gulp')
var debug = require('gulp-debug')
var karma = require('gulp-karma')
var browserify = require('browserify')
var glob = require('glob')
var jstransformify = require('jstransformify')
var source = require('vinyl-source-stream')
var streamify = require('gulp-streamify')
var foreach = require('gulp-foreach')

gulp.task('test-browser', function() {
	return gulp.src('./test/spec/**/*.spec.js')
		.pipe(foreach(function (stream, file) {
			return browserify(file.path)
				.transform({
					visitors: [
						require('jstransform/visitors/es6-arrow-function-visitors'),
						require('jstransform/visitors/es6-class-visitors'),
						require('jstransform/visitors/es6-object-short-notation-visitors'),
						require('jstransform/visitors/es6-rest-param-visitors'),
						require('jstransform/visitors/es6-template-visitors'),
						require('es6-module-jstransform/visitors')
					]
				}, jstransformify)
				.bundle({ debug: true, minify: true })
				.pipe(source(file.path))
		}))
		.pipe(gulp.dest('./.tmp'))
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'watch'
		}))
})