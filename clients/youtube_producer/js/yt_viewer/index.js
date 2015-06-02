module.exports = angular.module('yt_viewer', ['ngResource', 'pascalprecht.translate'])
    .directive('ytViewer', require('./yt_viewerDirective'))
    .constant('ytPlayerConfig', require('./yt_playerConfig'))
    .directive('ytPlayer', require('./yt_playerDirective'))
    .directive('ytVideoDescription', require('./yt_videoDescriptionDirective'))
    .directive('ytPlaylist', require('./yt_playlistDirective'))
    .directive('ytControlbar', require('./yt_controlbarDirective'));
