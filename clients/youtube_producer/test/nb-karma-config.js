/*jslint sloppy: true */
module.exports = function (config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        autoWatch: false,

        // ng template bundler
        preprocessors: {
            'js/**/*.js': ['coverage'],
            'test/fixtures/**/*.json': ['json_fixtures']
        },

        files: [
            '../../public/bower_components/angular/angular.js',
            '../../public/bower_components/angular-resource/angular-resource.js',
            '../../public/bower_components/angular-route/angular-route.js',
            '../../public/bower_components/angular-translate/angular-translate.min.js',
            '../../public/bower_components/angular-mocks/angular-mocks.js',
            '../../public/bower_components/angular-timeago/dist/angular-timeago.min.js',
            //include all test helpers from /test folder
            {pattern: 'test/**/!(spec.js)+(.js)'},
            // include templates fo ng-html2js
            {pattern: 'js/**/*.html'},
            // fixtures
             'test/fixtures/**/*.json',
            // app
            //{pattern: 'js/**/*.js'} // TODO: make it working ;)
            '../../public/youtube_producer/app-bundle.js'
        ],
        exclude: [
            'bower_components/**/test/*.js',
            'test/jasmine.coverage/**/*',
            'test/ng-karma-config.js'
        ],

        proxies: {
            '/some.img': 'test/fixtures/fake.img',
            '/other.img': 'test/fixtures/fake.img',
            '/assets/youtube_producer/img/play-icon.svg': 'test/fixtures/fake.img'
        },

        // Files to browserify
        browserify: {
            files: [
                // includes all js files except spec from /js folder
                //{pattern: 'js/**/!(spec.js)+(.js)'},
                // includes all js files except spec from /js folder and watch their changes
                {pattern: 'js/**/!(spec.js)+(.js)', watched: true, served: false, included: false},
                {pattern: 'test/**/*.spec.js'},
                {pattern: 'js/*/*.spec.js'}
            ]
        },

        coverageReporter: {
            type : 'html',
            dir : 'test/jasmine.coverage/',
            subdir: function(browser) {
                return browser.toLowerCase().split(/[ /-]/)[0];
            },
            reporters:[
                {type: 'cobertura' },
                {type: 'html' },
                {type: 'text-summary'}
            ]
        },

        jsonFixturesPreprocessor: {
            stripPrefix: 'test/fixtures/',
            variableName: '__fixtures__'
        }
    });
};