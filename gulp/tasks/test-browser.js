var gulp = require('gulp')
var debug = require('gulp-debug')
var karma = require('gulp-karma')
var cache = require('gulp-cached')
var browserify = require('browserify')
var path = require('path')
var es6Transpile = require('./utils/es6-transpile')
var glob = require('glob')
var jstransformify = require('jstransformify')
var source = require('vinyl-source-stream')
var streamify = require('gulp-streamify')

gulp.task('test-browser-old', function() {

	return gulp.src(['./test/spec/**/*.spec.js'])
		.pipe(browserify({
			insertGlobals : false,
			debug : true,
			transform: ['jstransformify'],
			
		}))
		.pipe(cache('browserified'))
		.pipe(gulp.dest('./.tmp'))
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'watch'
		}))
})

gulp.task('test-browser', function() {
// glob.sync('./test/spec/**/*.spec.js'), { cwd: process.cwd() }
	return browserify('./test/spec/constructor.spec.js')
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
		.bundle({ debug: true })

		.pipe(source('test/spec/constructor.spec.js'))
		// .pipe(streamify())
		// .pipe(debug({ verbose: true }))
		.pipe(gulp.dest('./.tmp'))
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'watch'
		}))
})