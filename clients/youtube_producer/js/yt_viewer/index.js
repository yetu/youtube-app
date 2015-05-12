module.exports = angular.module('yt_viewer', ['ngResource', 'pascalprecht.translate'])
    .directive('ytViewer', require('./yt_viewerDirective'))
    .directive('ytPlayer', require('./yt_playerDirective'))
    .directive('ytVideoDescription', require('./yt_videoDescriptionDirective'))
    .directive('ytPlaylist', require('./yt_playlistDirective'));

