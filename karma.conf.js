module.exports = function(config) {
	config.set({

		basePath: '.',

		frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai', 'es5-shim'],

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

		autoWatch: false,

		browsers: ['PhantomJS'],

		singleRun: true,
	})
}
