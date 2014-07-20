var gulp = require('gulp')
var jstransform = require('gulp-jstransform')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var streamify = require('gulp-streamify')
var size = require('gulp-size')
var transpile = require('./utils/transpile')
var browserify = require('browserify')
var jstransformify = require('jstransformify')
var source = require('vinyl-source-stream')
var envify = require('envify')
var visitors = require('./utils/visitors').visitors

var files = 'src/**/*.js'

gulp.task('build-4-node', function () {
	return gulp.src(files)
		.pipe(transpile())
		.pipe(gulp.dest('./lib/'))
})

gulp.task('build-4-browser', function () {
	return browserify('./src/iniettore.js')
		.transform({
			visitors: visitors,
			minify: true
		}, jstransformify)
		.transform({
			NODE_ENV: 'production'
		}, envify)
		.bundle({
			debug: false,
			insertGlobals: false,
			detectGlobals: true,
			standalone: 'iniettore',
			noBuiltins: true
		})
		.pipe(source('iniettore.js'))
		.pipe(gulp.dest('./dist'))
		.pipe(rename('iniettore.min.js'))
		.pipe(streamify(uglify()))
		.pipe(streamify(size({
			gzip: true
		})))
		.pipe(gulp.dest('./dist'))
})

gulp.task('build', ['build-4-node', 'build-4-browser'])