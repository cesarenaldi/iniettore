var gulp = require('gulp')
var mocha = require('gulp-mocha')
var debug = require('gulp-debug')

var jstransform = require('jstransform')
var fs = require('fs')

var paths = {
	scripts: [ 'test/spec/**/*.spec.js', 'lib/**/*.js' ]
}


global.expect = require('chai').expect,
global.sinon = require('sinon')
require('chai').use(require('sinon-chai'))


function stripBOM(content) {
  // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
  // because the buffer-to-string conversion in `fs.readFileSync()`
  // translates it to FEFF, the UTF-16 BOM.
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

var loader = require.extensions['.js']
require.extensions['.js'] = function(module, filename) {

	var src, visitors

	if (! (/iniettore\/(?:lib|test)/.test(filename)) ) {
		return loader.apply(this, [].slice.call(arguments))
	}

	src = fs.readFileSync(filename, {encoding: 'utf8'})
	visitors = [
		require('jstransform/visitors/es6-arrow-function-visitors'),
		require('jstransform/visitors/es6-class-visitors'),
		require('jstransform/visitors/es6-object-short-notation-visitors'),
		require('jstransform/visitors/es6-rest-param-visitors'),
		require('jstransform/visitors/es6-template-visitors'),
		require('es6-module-jstransform/visitors')
	].reduce(function(list, visitor) {
		return list.concat(visitor.visitorList)
	}, []);


	try {
		src = jstransform.transform(visitors, src, { minify: false })
	} catch (e) {
		throw new Error('Error transforming ' + filename + ' to ES6: ' + e.toString())
	}
	module._compile(stripBOM(src.code), filename)
}

gulp.task('test', function () {
	return gulp.src([ 'test/spec/**/*.spec.js' ], { read: false })
		.pipe(mocha({reporter: 'progress'}))
})


gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['test'])
})