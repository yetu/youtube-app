module.exports = angular.module('app_input', [])
    .constant('appKeyInputConfig', require('./app_keyInputConfig'))
	.directive('appKeyInput', require('./app_keyInputDirective'));
