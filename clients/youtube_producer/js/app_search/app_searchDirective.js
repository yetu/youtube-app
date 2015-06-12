/* global module */
/*
 * <app-search placeholder="" ng-model="" value="" trigger-search="enter,button,auto" auto-delay="" allow-repeat="" on-search="" on-reset="" 
 *             key-input="" remote-control=""></app-search>
 *
 * @attr placeholder string Placeholder text
 * @attr ng-model object Scope objects with .value field to be used as model for update
 * @attr value string Predefined value
 * @attr trigger-search string Comma separated triggers for searching start: enter - by Enter key, button - search button, auto - automatically started on typing
 * @attr auto-delay integer Triggering search after X ms of change (0 for disable) - for auto trigger
 * @attr allow-repeat boolean Allow repeatition of the same value if not changed (for example on enter and button)
 * @attr on-search string|fn Search event name (default 'app:search-value') or callback function
 * @attr on-reset string|fn Reset search event name (default 'app:search-reset') or callback function
 * @attr remote-control string Element name to be registered within remote control service
 * @attr key-input boolean [optional] Indicates if app-input directive has to be added
 */
module.exports = function (appRemoteControlService) {
    return {
        restrict: 'E',
        template: require('./app_searchTemplate.html'),
        scope: {
            searchQuery: '=?ngModel',
            placeholder: '@placeholder',
            keyInput: '@?'
        },
        link: function(scope, element, attr){
            var _unbinder = [],
                triggerButton = attr.triggerSearch && attr.triggerSearch.indexOf('button') > -1,
                triggerEnter = attr.triggerSearch && attr.triggerSearch.indexOf('enter') > -1,
                triggerAuto = attr.triggerSearch && attr.triggerSearch.indexOf('auto') > -1,
                input = element.find('input')[0],
                $input = angular.element(input);

            if(!scope.searchQuery) {
                scope.searchQuery = {};
            }

            if(attr.value) {
                scope.searchQuery.value = attr.value;
            }

            scope.searchButtonClick = function() {
                if (triggerButton === true) {
                    scope.initSearch(input.value);
                }
            };
            scope.searchOnKeyUp = function (event) {
                if (triggerEnter === true && event.keyCode === 13) {
                    scope.initSearch(event.target.value);
                }
            };
            scope.initSearch = function(value, auto) {
                if (scope.emitted === value && attr.allowRepeat !== "true") {
                    return;
                }
                // fixes late binding of auto param
                if(auto) {
                    triggerAuto = attr.triggerSearch && attr.triggerSearch.indexOf('auto') > -1;
                    if(!triggerAuto) {
                        return;
                    }
                }
                if (value) {
                    scope.$emit(attr.eventSearch || 'app:search-value', value);
                } else {
                    scope.$emit(attr.eventReset || 'app:search-reset');
                }
                scope.emitted = value;
            };

            $input.on('click', function() {
                if(!input.isFocused) {
                    input.select();
                    input.isFocused = true;
                }
            });

            $input.on('blur', function(event) {
                input.isFocused = false;
            });

            _unbinder.push(scope.$watchCollection('searchQuery', function (model) {
                if(model) {
                    scope.initSearch(model.value, true);
                }
            }));

            var remoteControl = function(command) {

                switch(command) {
                    case 'activate': {
                        element.attr('activated', true);
                        break;
                    }
                    case 'deactivate': {
                        element.attr('activated', false);
                        break;
                    }
                    case 'up':
                    case 'down': {
                        appRemoteControlService.deactivate(attr.remoteControl);
                        break;
                    }
                    case 'enter': {
                        var el = angular.element(element.find('button')[0]);
                        el.triggerHandler('click');
                        break;
                    }
                }
            };
            
            if(attr.remoteControl) {
                appRemoteControlService.register(attr.remoteControl, remoteControl);
            }

            scope.$on('$destroy', function() {
                if(attr.remoteControl) {
                    appRemoteControlService.deregister(attr.remoteControl, remoteControl);
                }
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
        }
    };
};

