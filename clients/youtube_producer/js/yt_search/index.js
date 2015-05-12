module.exports = angular.module('yt_search', ['ngResource', 'yaru22.angular-timeago'])
	.service('ytSearchService', require('./yt_searchService'));
