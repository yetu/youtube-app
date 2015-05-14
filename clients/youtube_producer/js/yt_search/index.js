module.exports = angular.module('yt_search', ['ngResource', 'yaru22.angular-timeago'])
	.service('ytYoutubeService', require('./yt_youtubeService'));
