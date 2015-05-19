/* global module, angular */
module.exports = angular.module('_configs', [])
	.constant('serverPathsConfig', require('./serverPathsConfig'))
    .constant('i18n', require('./i18nConfig'))
    .constant('ytPlayerConfig', require('./playerConfig'));
