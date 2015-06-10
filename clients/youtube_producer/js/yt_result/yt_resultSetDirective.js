/*
 * <yt-result-set ng-model="" display="" control="" play-link="" play-fn="" load-more=""></yt-result-set>
 *
 * @attr ng-model array Scope model to be used as data feed - with elements containing: { list_type, title, items},
 *                      where list_type determines search strategy - used by search/load
 * @attr display @see ui-video-list
 * @attr control @see ui-video-list
 * @attr play-link @see ui-video-list
 * @attr play-fn @see ui-video-list
 * @attr load-more @see ui-video-list
 *
 */
module.exports = function (appRemoteControlService, $location) {
	return {
		restrict: 'E',
		template: require('./yt_resultSetTemplate.html'),
        scope: {
            resultLists: '=ngModel',
            playLink: '@?playLink',
            playFn: '@?playFn',
            displayType: '@display',
            controlType: '@control',
            loadMore: '@loadMore'
        },
		controller: function($scope) {
		},
		link: function(scope, element, attr){
            var _unbinder = [],
                items, current, $current, lists, loadNext, row, elementDistance;

            var activate = function(act) {
                // deactivate old
                if(items[current]) {
                    angular.element(items[current]).attr('activated', false);
                    if(lists.length > 1) {
                        row = angular.element(items[current].parentNode).attr('row');
                        angular.element(items[current].parentNode.parentNode.parentNode).removeClass('row-' + row + '-activated');
                    }
                }
                // activate new
                current = act;
                if(current !== null) {
                    var parent = items[current].parentNode,
                        $parent = angular.element(parent),
                        $container = angular.element(parent.parentNode.parentNode);

                    $current = angular.element(items[current]).attr('activated', true);

                    if(lists.length > 1) {
                        row = $parent.attr('row');
                        $container.addClass('row-' + row + '-activated');
                    } else {
                        $container.css({transform: 'translate(-' + (current * elementDistance.x) + 'px, 0px)'}); // TODO: evantually add control of Y
                    }
                }
            };

            var remoteControl = function(command) {
                
                switch(command) {
                    case 'activate': {
                        element.attr('activated', true);
                        lists = element.find('ui-video-list');
                        items = element.find('ui-video-list-item');
                        if(lists[0]) {
                            loadNext = angular.element(lists[0]).isolateScope().loadNext;
                        }
                        elementDistance = {
                            x: items[1] && items[0] ? items[1].offsetLeft - items[0].offsetLeft : 0,
                            y: items[1] && items[0] ? items[1].offsetTop - items[0].offsetTop : 0
                        };
                        activate(0);
                        break;
                    }
                    case 'deactivate': {
                        element.attr('activated', false);
                        activate(null);
                        break;
                    }
                    case 'left':
                    case 'up': {
                        var num = command === 'left' ? 1 : 4;
                        if(current - num > 0) {
                            activate(current - num);
                        } else {
                            if(current === 0) {
                                // deaxtivate on next press of first element
                                appRemoteControlService.deactivate(attr.remoteControl);
                                return;
                            }
                            activate(0);
                        }
                        break;
                    }
                    case 'right':
                    case 'down': {
                        var num = command === 'right' ? 1 : 4;
                        if(current + num < items.length) {
                            activate(current + num);
                        } else {
                            if(current === items.length - 1) {
                                // deaxtivate on next press of last element
                                appRemoteControlService.deactivate(attr.remoteControl);
                                return;
                            }
                            activate(items.length - 1);
                        }
                        // load more if button with method exists and list is single type
                        if(current + num >= items.length - 8) {
                            if(loadNext && lists.length === 1) {
                                loadNext(function() {
                                    items = element.find('ui-video-list-item');
                                });
                            }
                        }
                        break;
                    }
                    case 'enter': {
                        var el = $current.find('a')[0];
                        if(el.hash) {
                            $location.path(el.hash.substring(1));
                        }
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