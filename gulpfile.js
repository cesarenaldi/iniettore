var gulp = require('gulp')
var coveralls = require('gulp-coveralls')
var requireDir = require('require-dir')
var runSequence = require('run-sequence')
var dir = requireDir('./tasks')

gulp.task('send-coverage-report', function (done) {
	gulp.src('./coverage/**/lcov.info')
		.pipe(coveralls())
})

gulp.task('test', function (done) {
	runSequence(
		'test-node',
		'test-browser',
		done
	)
})

gulp.task('test-ci', function (done) {
	runSequence(
		'test',
		'send-coverage-report',
		done
	)
})

gulp.task('default', function (done) {
	runSequence(
		'test',
		'build',
		done
	)
})
