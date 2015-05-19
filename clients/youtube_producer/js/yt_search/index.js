module.exports = angular.module('yt_search', ['ngResource', 'yaru22.angular-timeago'])
    .constant('ytYoutubeServiceConfig', require('./yt_youtubeServiceConfig'))
	.service('ytYoutubeService', require('./yt_youtubeService'));
