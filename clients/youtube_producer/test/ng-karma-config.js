/*jslint sloppy: true */
module.exports = function (config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        browsers: ['Chrome', 'PhantomJS', 'Firefox'],
        autoWatch: true,

        // ng template bundler
        preprocessors: {
            '**/*.html': ['ng-html2js'],
            '/**/*.browserify': ['browserify'],
            'js/**/*.js': ['coverage']
        },

        files: [
            '../../public/bower_components/angular/angular.js',
            '../../public/bower_components/angular-resource/angular-resource.js',
            '../../public/bower_components/angular-route/angular-route.js',
            '../../public/bower_components/angular-translate/angular-translate.min.js',
            '../../public/bower_components/angular-mocks/angular-mocks.js',
            '../../public/bower_components/reactTo/reactTo.js',
            '../../public/bower_components/angular-timeago/dist/angular-timeago.min.js',
            //include all test helpers from /test folder
            {pattern: 'test/**/!(spec.js)+(.js)'},
            // include templates fo ng-html2js
            {pattern: 'js/**/*.html'},
            // app?
            //{pattern: 'js/**/*.js'}
            '../../public/youtube_producer/app-bundle.js'
        ],
        exclude: [
            'bower_components/**/test/*.js',
            'test/jasmine.coverage/**/*',
            'test/ng-karma-config.js'
        ],

        // Files to browserify
        browserify: {
            files: [
                // includes all js files except spec from /js folder
                //{pattern: 'js/**/!(spec.js)+(.js)'},
                // includes all js files except spec from /js folder and watch their changes
                {pattern: 'js/**/!(spec.js)+(.js)', watched: true, served: false, included: false},
                {pattern: 'test/**/*.spec.js'},
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

        ngHtml2JsPreprocessor: {
            // setting this option will create only a single module that contains templates
            // from all the files, so you can load them all with module('foo')
            moduleName: 'templates'
        },

        reportSlowerThan: 500
    });
};