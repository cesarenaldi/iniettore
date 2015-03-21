var gulp = require('gulp')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var streamify = require('gulp-streamify')
var size = require('gulp-size')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var envify = require('envify')
var babel = require('gulp-babel')
var babelify = require("babelify")

gulp.task('build-4-node', function () {
	return gulp.src('src/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest('./lib/'))
})

gulp.task('build-4-browser', function () {
	return browserify('./src/iniettore.js')
		.transform(babelify)
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
		.pipe(streamify(size()))
		.pipe(streamify(size({ gzip: true })))
		.pipe(gulp.dest('./dist'))
})

gulp.task('build', ['build-4-node', 'build-4-browser'])
