var karma = require('karma').server,
		path = require('path'),
		cfg = require('../../common-config').path.tests,
		gulp = require('gulp');

gulp.task('tdd', function () {
	var options = {
		configFile: path.join(cfg.configDir, 'ng-karma-config.js'),
		singleRun: false
	};

	options.browsers = ['PhantomJS', 'Chrome'];
	karma.start(options, console.error.bind(console));
});

gulp.task('coverage', function () {
	var options = {
		configFile: path.join(cfg.configDir, 'ng-karma-config.js'),
		singleRun: false,
        reporters: ['coverage'],
        preprocessors: {
            'js/**/*.js': 'coverage'
        }
	};

	options.browsers = ['PhantomJS'];
	karma.start(options, console.error.bind(console));
});
