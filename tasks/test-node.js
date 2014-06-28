var gulp = require('gulp')
var mocha = require('gulp-mocha')

gulp.task('test-node', function () {

	require('./utils/runtime-transpiler')

	global.expect = require('chai').expect,
	global.sinon = require('sinon')
	require('chai').use(require('sinon-chai'))

	return gulp.src([ 'test/spec/**/*.spec.js' ], { read: false })
		.pipe(mocha({
			reporter: 'progress'
		}))
})