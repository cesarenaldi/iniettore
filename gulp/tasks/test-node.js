var gulp = require('gulp')
var mocha = require('gulp-mocha')

gulp.task('test-node', function () {

	require('./utils/runtime-transpiler')

	return gulp.src([ 'test/spec/**/*.spec.js' ], { read: false })
		.pipe(mocha({reporter: 'progress'}))
})