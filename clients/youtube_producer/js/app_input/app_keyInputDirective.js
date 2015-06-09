/* global module */
/*
 * <app-key-input ng-model="" remote-control=""></app-key-input>
 *
 * @attr ng-model string Scope variable to be used as model for update
 * @attr remote-control string Element name to be registered within remote control service
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
                if(event.target) {
                    var char = angular.element(event.target).attr('char'),
                        value = scope.$parent.$parent.searchValue || '';
                        //value = scope.inputValue || '';
                    //scope.inputValue = value + char;
                    scope.$parent.$parent.searchValue = value + char; // TODO: fix workaround for binding
                }
            };

            scope.deleteChar = function() {
                var value = scope.$parent.$parent.searchValue || '',
                    //value = scope.inputValue || '',
                    length = value.length;
                if(length > 0) {
                    //scope.inputValue = value.substring(0, length - 1);
                    scope.$parent.$parent.searchValue = value.substring(0, length - 1); // TODO: fix workaround for binding
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
                        appRemoteControlService.deactivate(attr.remoteControl);
                        break;
                    }
                }

                if (!scope.$$phase) {
                    scope.$apply();
                }
            };

            // on init
            scope.switchList('letters');
            if(attr.remoteControl) {
                appRemoteControlService.register(attr.remoteControl, remoteControl);
            }
            
            scope.$on('$destroy', function() {
                if(attr.remoteControl) {
                    appRemoteControlService.deregister(attr.remoteControl);
                }
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
        }
    };
};

