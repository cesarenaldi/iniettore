module.exports = function(config) {
	config.set({

		basePath: '.',

		frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],

		exclude: [],

		preprocessors: {},

		browserify: {
			debug: true,
			watch: true
		},

		reporters: ['spec'],

		// web server port
		port: 9876,

		colors: true,

		logLevel: config.LOG_INFO,

		autoWatch: true,

		browsers: ['Chrome'],

		singleRun: false,
	})
}
