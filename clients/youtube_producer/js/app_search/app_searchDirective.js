/* global module */
/*
 * <app-search placeholder="" value="" trigger-search="enter,button,auto" auto-delay="" allow-repeat="" on-search="" on-reset=""></app-search>
 *
 * @attr placeholder string Placeholder text
 * @attr value string Predefined value
 * @attr trigger-search string Comma separated triggers for searching start: enter - by Enter key, button - search button, auto - automatically started on typing
 * @attr auto-delay integer Triggering search after X ms of change (0 for disable) - for auto trigger
 * @attr allow-repeat boolean Allow repeatition of the same value if not changed (for example on enter and button)
 * @attr on-search string|fn Search event name (default 'app:search-value') or callback function
 * @attr on-reset string|fn Reset search event name (default 'app:search-reset') or callback function
 */
module.exports = function () {
    return {
        restrict: 'E',
        template: require('./app_searchTemplate.html'),
        scope: {
            searchValue: '@value',
            placeholder: '@placeholder'
        },
        link: function(scope, element, attr){
            var _unbinder = [],
                triggerButton = attr.triggerSearch && attr.triggerSearch.indexOf('button') > -1,
                triggerEnter = attr.triggerSearch && attr.triggerSearch.indexOf('enter') > -1,
                triggerAuto = attr.triggerSearch && attr.triggerSearch.indexOf('auto') > -1,
                input = element.find('input')[0],
                $input = angular.element(input);

            scope.resetButtonClick = function() {
                input.value = '';
                scope.initSearch('');
            };

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
            scope.initSearch = function(value) {
                if (scope.emitted === value && attr.allowRepeat !== "true") {
                    return;
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

            if(triggerAuto) {
                _unbinder.push(scope.$watch('searchValue', function (value) {
                    if (value !== "") {
                        scope.initSearch(value);
                    }
                }));
            }

            scope.$on('$destroy', function() {
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
        }
    };
};

