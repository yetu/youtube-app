module.exports = angular.module('app_remoteControl', [])
    .constant('appRemoteControlConfig', require('./app_remoteControlConfig'))
	.service('appRemoteControlService', require('./app_remoteControlService'));
