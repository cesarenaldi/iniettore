var gulp = require('gulp')
var mocha = require('gulp-mocha')
var gutil = require('gulp-util')

gulp.task('test-node', function () {

	require('babel/register')

	global.expect = require('chai').expect,
	global.sinon = require('sinon')
	require('chai').use(require('sinon-chai'))

	return gulp.src([ 'test/spec/**/*.spec.js' ], { read: false })
		.pipe(mocha({
			reporter: 'progress'
		}))
		.on('error', function (err) {
			gutil.log(gutil.colors.yellow(err.message))
			this.emit('end')
		})
})
