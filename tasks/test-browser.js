var gulp = require('gulp')
var karma = require('gulp-karma')
var istanbul = require('browserify-istanbul')
var browserify = require('browserify')
var jstransformify = require('jstransformify')
var source = require('vinyl-source-stream')
var foreach = require('gulp-foreach')
var visitors = require('./utils/visitors').visitors

gulp.task('test-browser', function() {
	return gulp.src('./test/spec/**/*.spec.js')
		.pipe(foreach(function (stream, file) {
			return browserify(file.path)
				.transform({
					visitors: visitors,
					minify: true
				}, jstransformify)
				.transform(istanbul({
					ignore: ['**/node_modules/**', '**/test/**'],
					defaultIgnore: true
				}))
				.bundle({
					debug: true,
					insertGlobals: false,
					detectGlobals: true,
					noBuiltins: true
				})
				.pipe(source(file.path))
		}))
		.pipe(gulp.dest('./.tmp'))
		.pipe(karma({
			configFile: 'karma.conf.js'
		}))
})