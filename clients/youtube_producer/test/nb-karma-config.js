/*jslint sloppy: true */
module.exports = function (config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        autoWatch: false,

        // ng template bundler
        preprocessors: {
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
        }
    });
};