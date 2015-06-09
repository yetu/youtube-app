module.exports = function ($timeout, $window, $location, ytPlayerConfig, appRemoteControlService) {
    'use strict';
    return {
        restrict: 'E',
        template: require('./yt_controlbarTemplate.html'),
        scope: {
            info: '='
        },
        link: function (scope, element, attrs) {

            var remoteControl = function(command) {
                switch(command) {
                    case 'left': {
                        scope.highlightRewind = true;
                        $timeout(resetHighlight, ytPlayerConfig.video.highlightTimeout);
                        break;
                    }
                    case 'right': {
                        scope.highlightForward = true;
                        $timeout(resetHighlight, ytPlayerConfig.video.highlightTimeout);
                        break;
                    }
                    case 'down': {
                        scope.isVisible = !scope.isVisible;
                        break;
                    }
                    case 'quit': {
                        if($window.history.length > 2) {
                            window.history.back();
                        } else {
                            $location.path('/');
                        }
                        break;
                    }
                }
                if (!scope.$$phase) {
                    scope.$apply();
                }
            };

            var resetHighlight = function() {
                scope.highlightForward = false;
                scope.highlightRewind = false;
            };

            appRemoteControlService.register('controlbar', remoteControl);

            scope.$on('$destroy', function() {
                appRemoteControlService.deregister('controlbar');
            });
        }
    };
};