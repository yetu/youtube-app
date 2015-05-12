module.exports = angular.module('yt_result', ['ngResource', 'pascalprecht.translate', 'reactTo', 'ui_videoList'])
    .directive('ytResultSet', require('./yt_resultSetDirective'));

