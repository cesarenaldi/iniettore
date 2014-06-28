var gulp = require('gulp')
var requireDir = require('require-dir')
var runSequence = require('run-sequence')
var dir = requireDir('./tasks')

gulp.task('watch', function() {
	gulp.watch(['test/spec/**/*.spec.js', 'lib/**/*.js'], ['test-node'])
})

gulp.task('dev', ['watch', 'test-node'])
gulp.task('default', function (done) {
	runSequence(
		'test-node',
		'test-browser',
		'build',
		done
	)
})