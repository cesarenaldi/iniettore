var gulp = require('gulp')

module.exports = function(tasks) {
	tasks.forEach(function(name) {
		require('./tasks/' + name)
	})
	return gulp
}