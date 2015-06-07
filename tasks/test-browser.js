var gulp = require('gulp')
var karma = require('gulp-karma')
var istanbul = require('browserify-istanbul')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var foreach = require('gulp-foreach')
var babelify = require('babelify')

gulp.task('test-browser', function() {
	return gulp.src('./test/spec/**/*.spec.js')
		.pipe(foreach(function (stream, file) {
			return browserify(file.path, {
					debug: true,
					insertGlobals: false,
					detectGlobals: true,
					noBuiltins: true
				})
				.transform(babelify)
				.transform(istanbul({
					ignore: ['**/node_modules/**', '**/test/**'],
					defaultIgnore: true
				}))
				.bundle()
				.pipe(source(file.path))
		}))
		.pipe(gulp.dest('./.tmp'))
		.pipe(karma({
			configFile: 'karma.conf.js'
		}))
})
