module.exports = function($rootScope, appSendToTvService) {
    return {
        restrict: 'E',
        template: require('./app_sendToTvTemplate.html'),
        scope: {
            class: '@class',
            data: '=ngModel',
            playingOnTv: '=?'
        },
        link: function(scope) {
            scope.onSendButtonClick = function() {
                if(!scope.playingOnTv) {
                    appSendToTvService.sendToTv(scope.data);
                } else {
                    $rootScope.$broadcast('appSendToTv:resume');
                }
                scope.playingOnTv = !scope.playingOnTv;
            };
        }
    };
};
