module.exports = angular.module('ui_videoList', ['ngResource', 'pascalprecht.translate', 'infinite-scroll'])
	.directive('uiVideoList', require('./ui_videoListDirective'))
	.directive('uiVideoListItem', require('./ui_videoListItemDirective'));

