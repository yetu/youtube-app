/* global module */
/*
 * <app-key-input ng-model="" remote=""></app-key-input>
 */
module.exports = function (appKeyInputConfig, appRemoteControlService) {
    return {
        restrict: 'E',
        template: require('./app_keyInputTemplate.html'),
        scope: {
            inputValue: '=ngModel'
        },
        link: function(scope, element, attr){
            var _unbinder = [];

            scope.letters = appKeyInputConfig.letters;
            scope.numbers = appKeyInputConfig.numbers;

            scope.switchList = function(type) {
                type = type || scope.next;
                scope.keyList = scope[type];
                scope.current = 0;
                scope.next = 'letters' === type ? 'numbers' : 'letters';
            };

            scope.addChar = function(event) {
                console.debug(event);
                if(event.target) {
                    var char = angular.element(event.target).attr('char'),
                        value = scope.$parent.$parent.searchValue || '';
                        //value = scope.inputValue || '';
                    //scope.inputValue = value + char;
                    scope.$parent.$parent.searchValue = value + char; // TODO: fix workaround for binding
                }
            };

            var remoteControl = function(command) {

                switch(command) {
                    case 'activate': {
                        scope.current = 0;
                        element.attr('activated', true);
                        break;
                    }
                    case 'deactivate': {
                        scope.current = -1;
                        element.attr('activated', false);
                        break;
                    }
                    case 'enter': {
                        var el = angular.element(element.find('li')[scope.current]);
                        el.triggerHandler('click');
                        break;
                    }
                    case 'left': {
                        scope.current--;
                        if(scope.current < 0) {
                            scope.current = scope.keyList.length + 1;
                        }
                        break;
                    }
                    case 'right': {
                        scope.current++;
                        if(scope.current > scope.keyList.length + 1) {
                            scope.current = 0;
                        }
                        break;
                    }
                    case 'up':
                    case 'down':
                    case 'back': {
                        appRemoteControlService.deactivate(attr.remote);
                        break;
                    }
                }
            };

            // on init
            scope.switchList('letters');
            if(attr.remote) {
                appRemoteControlService.register(attr.remote, remoteControl);
            }
            
            scope.$on('$destroy', function() {
                if(attr.remote) {
                    appRemoteControlService.deregister(attr.remote);
                }
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
        }
    };
};

