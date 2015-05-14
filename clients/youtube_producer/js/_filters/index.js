/* global angular, module */
module.exports = angular.module('_filters', [])
	.filter('duration', require('./durationFilter'));
