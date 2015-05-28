module.exports = angular.module('ui_videoList', ['ngResource', 'pascalprecht.translate'])
	.directive('uiVideoList', require('./ui_videoListDirective'))
	.directive('uiVideoListItem', require('./ui_videoListItemDirective'))
    .directive('uiVideoListPlayArrow', require('./ui_videoListPlayArrowDirective'));

