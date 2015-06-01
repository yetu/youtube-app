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
                    if(!scope.pendingSend) {
                        scope.pendingSend = true;
                        appSendToTvService.sendToTv(scope.data)
                            .then(function() {
                                scope.playingOnTv = true;
                            })
                            .finally(function() {
                                scope.pendingSend = false;
                            });
                    }
                } else {
                    scope.playingOnTv = false;
                    $rootScope.$broadcast('appSendToTv:resume');
                }
            };
        }
    };
};
