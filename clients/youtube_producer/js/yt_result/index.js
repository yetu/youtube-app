module.exports = angular.module('yt_result', ['ngResource', 'pascalprecht.translate', 'ui_videoList'])
    .directive('ytResultSet', require('./yt_resultSetDirective'));

