var gulp = require('gulp')
var mocha = require('gulp-mocha')

require('./utils/runtime-transpiler')

gulp.task('test-node', function () {
	return gulp.src([ 'test/spec/**/*.spec.js' ], { read: false })
		.pipe(mocha({reporter: 'progress'}))
})