/* global module */
/*
 * <app-key-input ng-model="" remote-control="" activate-parent=""></app-key-input>
 *
 * @attr ng-model object Scope objects with .value field to be used as model for update
 * @attr remote-control string Element name to be registered within remote control service
 * @attr activate-parent string Indicates if parent element with given name should be set as activated on remote control activation
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
                        value = scope.inputValue.value || '';

                    scope.inputValue.value = value + char;
                }
            };

            scope.deleteChar = function() {
                var value = scope.inputValue.value || '',
                    length = value.length;
                if(length > 0) {
                    scope.inputValue.value = value.substring(0, length - 1);
                }
            };

            var findParent = function(el, name) {
                var tag = name.toUpperCase();
                if(el.parentNode && el.parentNode.tagName === tag) {
                    return angular.element(el.parentNode);
                } else if(el.parentNode) {
                    return findParent(el.parentNode, name);
                } else {
                    throw new Error('Parent tag not found: ' + name);
                }
            };

            var remoteControl = function(command) {

                switch(command) {
                    case 'activate': {
                        if(scope.current === -1) {
                            scope.current = 0;
                        }
                        element.attr('activated', true);
                        if(attr.activateParent) {
                            findParent(element[0], attr.activateParent).attr('activated', true);
                        }
                        break;
                    }
                    case 'deactivate': {
                        scope.current = -1;
                        element.attr('activated', false);
                        if(attr.activateParent) {
                            findParent(element[0], attr.activateParent).attr('activated', false);
                        }
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

