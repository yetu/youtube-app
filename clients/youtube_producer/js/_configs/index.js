/* global module, angular */
module.exports = angular.module('_configs', [])
	.constant('serverPathsConfig', require('./serverPathsConfig'))
    .constant('ytYoutubeServiceConfig', require('./youtubeServiceConfig'))
    .constant('i18n', require('./i18nConfig'));
