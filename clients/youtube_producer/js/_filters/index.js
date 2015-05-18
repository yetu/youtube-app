/* global angular, module */
module.exports = angular.module('_filters', [])
	.filter('duration', require('./durationFilter'))
    .filter('nl2br', require('./nl2brFilter'));
