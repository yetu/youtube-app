module.exports = angular.module('app_sendToTv', ['ngResource'])
  .service('appSendToTvService', require('./app_sendToTvService'))
  .directive('appSendToTv', require('./app_sendToTvDirective'));


