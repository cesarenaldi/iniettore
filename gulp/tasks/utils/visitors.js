module.exports = [
	require('jstransform/visitors/es6-arrow-function-visitors'),
	require('jstransform/visitors/es6-class-visitors'),
	require('jstransform/visitors/es6-object-short-notation-visitors'),
	require('jstransform/visitors/es6-rest-param-visitors'),
	require('jstransform/visitors/es6-template-visitors'),
	require('es6-module-jstransform/visitors')
].reduce(function(list, visitor) {
	return list.concat(visitor.visitorList)
}, []);