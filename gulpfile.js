var gulp = require('gulp')
var requireDir = require('require-dir')
var runSequence = require('run-sequence')
var dir = requireDir('./tasks')

gulp.task('watch', function() {
	gulp.watch(['test/spec/**/*.spec.js', 'src/**/*.js'], ['test-node'])
})

gulp.task('dev', ['watch', 'test-node'])

gulp.task('test', function (done) {
	runSequence(
		'test-node',
		'test-browser',
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