var gulp = require('./gulp')([
    'test-node',
    'test-browser'
])

gulp.task('watch', function() {
	gulp.watch(['test/spec/**/*.spec.js', 'lib/**/*.js'], ['test'])
})

gulp.task('dev', ['watch', 'test-node'])
gulp.task('default', ['test-node', 'test-browser'])